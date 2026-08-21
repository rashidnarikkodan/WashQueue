import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import logger from "@/configs/logger.config"
import { BookingStatus } from "../../domain/entities/Booking"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "../../domain/repositories/booking-status-log.repository"
import { BookingStatusLog } from "../../domain/entities/BookingStatusLog"
import { IBookingQueueService } from "../interfaces/booking-queue.interface"
import { IBookingNotificationService } from "../interfaces/booking-notification.interface"
import { BookingDTOMapper } from "../mappers/booking-dto.mapper"
import { BookingResponseDTO } from "../dtos/booking-response.dto"
import { IManagerAssignmentRepository } from "@/modules/manager/domain/repositories/manager-assignment.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"

export interface SavePreInspectionInput {
  bookingId: string
  photos?: string[]
  notes?: string
}

const REQUIRED_INSPECTION_PHOTO_COUNT = 4

export class SavePreInspectionAndCheckInUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly redisQueueService: IBookingQueueService,
    private readonly notificationService: IBookingNotificationService,
    private readonly stationRepository: IStationRepository,
    private readonly managerAssignmentRepository: IManagerAssignmentRepository
  ) {}

  async execute(
    managerUserId: string,
    input: SavePreInspectionInput
  ): Promise<BookingResponseDTO> {
    const { bookingId, photos = [], notes = "" } = input

    if (!bookingId) {
      throw new AppError("Booking ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const existing = await this.bookingRepository.findById(bookingId)
    if (!existing) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND)
    }

    if (existing.status !== BookingStatus.CONFIRMED) {
      throw new AppError(
        `Pre-service inspection and check-in requires CONFIRMED status. Current status is ${existing.status}`,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const station = await this.stationRepository.findById(existing.stationId)
    if (!station) {
      throw new AppError("Station not found for this booking", HTTP_STATUS.NOT_FOUND)
    }

    const isOwner = station.ownerId === managerUserId
    let isAuthorizedManager = isOwner

    if (!isAuthorizedManager) {
      const assignment = await this.managerAssignmentRepository.findByUserAndStation(
        managerUserId,
        existing.stationId
      )
      if (assignment && assignment.status === "ACTIVE") {
        isAuthorizedManager = true
      }
    }

    if (!isAuthorizedManager) {
      throw new AppError(
        "You are not authorized to complete pre-service inspection for this station",
        HTTP_STATUS.FORBIDDEN
      )
    }

    const now = new Date()

    if (photos.filter(Boolean).length < REQUIRED_INSPECTION_PHOTO_COUNT) {
      throw new AppError(
        `Pre-service inspection requires all ${REQUIRED_INSPECTION_PHOTO_COUNT} vehicle angle photos (front, rear, left, right) before check-in`,
        HTTP_STATUS.BAD_REQUEST
      )
    }
    const inspectionRecord = {
      photos,
      notes: notes.trim() || "Pre-service inspection completed",
      capturedBy: managerUserId,
      capturedAt: now,
    }

    existing.completePreInspection(inspectionRecord, managerUserId)

    const domainBooking = await this.bookingRepository.updateWithStatusGuard(
      existing,
      BookingStatus.CONFIRMED
    )

    if (!domainBooking) {
      throw new AppError(
        "Check-in failed. Booking may have already been checked in or status changed.",
        HTTP_STATUS.CONFLICT
      )
    }

    const statusLog = new BookingStatusLog({
      id: "",
      bookingId: domainBooking.id,
      fromStatus: BookingStatus.CONFIRMED,
      toStatus: BookingStatus.CHECKED_IN,
      changedBy: managerUserId,
      reason: notes ? `Pre-service inspection logged: ${notes}` : "Pre-service inspection completed",
      createdAt: now,
    })
    await this.bookingStatusLogRepository.save(statusLog)

    await this.redisQueueService.pushToStationQueue(domainBooking)

    await this.notificationService.notify("CHECKIN_SUCCESS", domainBooking)

    return BookingDTOMapper.toDTO(domainBooking)
  }
}
