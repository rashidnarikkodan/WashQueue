import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
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

export interface SavePostInspectionInput {
  bookingId: string
  photos?: string[]
  notes?: string
}

// Front, rear, left, right — the same 4 angles PostInspectionPage.tsx captures on the client.
const REQUIRED_INSPECTION_PHOTO_COUNT = 4

export class SavePostInspectionUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly stationRepository: IStationRepository,
    private readonly managerAssignmentRepository: IManagerAssignmentRepository,
    private readonly redisQueueService: IBookingQueueService,
    private readonly notificationService: IBookingNotificationService
  ) {}

  async execute(
    managerUserId: string,
    input: SavePostInspectionInput
  ): Promise<BookingResponseDTO> {
    const { bookingId, photos = [], notes = "" } = input

    if (!bookingId) {
      throw new AppError("Booking ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const booking = await this.bookingRepository.findById(bookingId)
    if (!booking) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND)
    }

    // 1. Manager Authorization Check
    const station = await this.stationRepository.findById(booking.stationId)
    if (!station) {
      throw new AppError("Station not found for this booking", HTTP_STATUS.NOT_FOUND)
    }

    const isOwner = station.getProps().ownerId === managerUserId
    let isAuthorizedManager = isOwner

    if (!isAuthorizedManager) {
      const assignment = await this.managerAssignmentRepository.findByUserAndStation(
        managerUserId,
        booking.stationId
      )
      if (assignment && assignment.status === "ACTIVE") {
        isAuthorizedManager = true
      }
    }

    if (!isAuthorizedManager) {
      throw new AppError(
        "You are not authorized to complete post-inspection for this station",
        HTTP_STATUS.FORBIDDEN
      )
    }

    // 2. Status Eligibility Check (Must be IN_SERVICE)
    if (booking.status !== BookingStatus.IN_SERVICE) {
      throw new AppError(
        `Post-service inspection requires IN_SERVICE status. Current status is ${booking.status}`,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    if (photos.filter(Boolean).length < REQUIRED_INSPECTION_PHOTO_COUNT) {
      throw new AppError(
        `Post-service inspection requires all ${REQUIRED_INSPECTION_PHOTO_COUNT} vehicle angle photos (front, rear, left, right) before handover`,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const now = new Date()
    const inspectionRecord = {
      photos,
      notes: notes.trim() || "Post-service quality inspection verified",
      capturedBy: managerUserId,
      capturedAt: now,
    }

    booking.completePostInspection(inspectionRecord)

    // Optimistic-concurrency guard (IN_SERVICE -> AWAITING_HANDOVER) to prevent duplicate completion submissions
    const domainBooking = await this.bookingRepository.updateWithStatusGuard(
      booking,
      BookingStatus.IN_SERVICE
    )

    if (!domainBooking) {
      throw new AppError(
        "Failed to save post-service inspection. Service completion may have already been submitted.",
        HTTP_STATUS.CONFLICT
      )
    }

    // 4. Save Status Log
    const statusLog = new BookingStatusLog({
      id: "",
      bookingId: domainBooking.id,
      fromStatus: BookingStatus.IN_SERVICE,
      toStatus: BookingStatus.AWAITING_HANDOVER,
      changedBy: managerUserId,
      reason: notes ? `Post-inspection completed: ${notes}` : "Wash service completed & post-inspection verified",
      createdAt: now,
    })
    await this.bookingStatusLogRepository.save(statusLog)

    // 5. Update Redis Queue State (Frees active bay capacity)
    await this.redisQueueService.updateQueueStatus(domainBooking)

    // 6. Dispatch Notification Event
    await this.notificationService.notify("WASH_COMPLETED", domainBooking)

    return BookingDTOMapper.toDTO(domainBooking)
  }
}
