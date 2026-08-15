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
import { BookingModel } from "../../infrastructure/models/booking.model"
import { BookingMapper } from "../../infrastructure/mappers/booking.mapper"

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
    private readonly notificationService: IBookingNotificationService
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
          existing.markNoShow()
          await this.bookingRepository.save(existing)
        } catch (err) {
          console.warn(`[SavePreInspection] Failed to mark booking ${existing.id} as NO_SHOW:`, err)
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

    // Atomic findOneAndUpdate with status: CONFIRMED to prevent race conditions & duplicate check-ins
    const updatedDoc = await BookingModel.findOneAndUpdate(
      { _id: bookingId, status: BookingStatus.CONFIRMED },
      {
        $set: {
          status: BookingStatus.CHECKED_IN,
          checkedInAt: now,
          checkedInBy: managerUserId,
          preServiceInspection: inspectionRecord,
          updatedAt: now,
        },
      },
      { new: true }
    )
      .populate("stationId")
      .populate("vehicleId")
      .populate("userId")

    if (!updatedDoc) {
      throw new AppError(
        "Check-in failed. Booking may have already been checked in or status changed.",
        HTTP_STATUS.CONFLICT
      )
    }

    const domainBooking = BookingMapper.toDomain(updatedDoc)

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
