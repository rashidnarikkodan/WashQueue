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

// Front, rear, left, right — the same 4 angles PreInspectionPage.tsx captures on the client.
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

    // Manager Authorization Check — ensure the caller runs this booking's station
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

    if (existing.scheduling?.windowStart && existing.scheduling?.windowEnd) {
      const windowStart = new Date(existing.scheduling.windowStart)
      const windowEnd = new Date(existing.scheduling.windowEnd)
      const nowMs = now.getTime()

      const formatWindowTime = (d: Date) =>
        d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })

      if (nowMs < windowStart.getTime()) {
        const startTimeFormatted = formatWindowTime(windowStart)
        const endTimeFormatted = formatWindowTime(windowEnd)
        throw new AppError(
          `Early Arrival Warning: Customer arrived before their booked time window (${startTimeFormatted} - ${endTimeFormatted}). Check-in is not allowed until ${startTimeFormatted}.`,
          HTTP_STATUS.BAD_REQUEST
        )
      }

      if (nowMs > windowEnd.getTime()) {
        const startTimeFormatted = formatWindowTime(windowStart)
        const endTimeFormatted = formatWindowTime(windowEnd)

        try {
          const fromStatus = existing.status
          existing.markNoShow()
          await this.bookingRepository.save(existing)
          await this.bookingStatusLogRepository.save(
            new BookingStatusLog({
              id: "",
              bookingId: existing.id,
              fromStatus,
              toStatus: BookingStatus.NO_SHOW,
              changedBy: managerUserId,
              reason: "Auto-marked NO_SHOW: customer's time window expired before pre-service inspection was submitted",
              createdAt: now,
            })
          )
        } catch (err) {
          logger.warn({ error: err, bookingId: existing.id }, "[SavePreInspection] Failed to mark booking as NO_SHOW")
        }

        throw new AppError(
          `Time Window Expired: The booking time window (${startTimeFormatted} - ${endTimeFormatted}) has passed. Customer missed their window and the booking is marked as NO_SHOW.`,
          HTTP_STATUS.BAD_REQUEST
        )
      }
    }

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

    // Optimistic-concurrency guard prevents race conditions & duplicate check-ins
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

    // Save audit log
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

    // Push to Redis station queue
    await this.redisQueueService.pushToStationQueue(domainBooking)

    // Send notification
    await this.notificationService.notify("CHECKIN_SUCCESS", domainBooking)

    return BookingDTOMapper.toDTO(domainBooking)
  }
}
