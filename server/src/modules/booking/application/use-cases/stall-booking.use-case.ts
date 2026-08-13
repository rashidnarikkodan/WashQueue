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

export interface StallBookingInput {
  bookingId: string
  reason: string
}

export class StallBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly redisQueueService: IBookingQueueService,
    private readonly notificationService: IBookingNotificationService
  ) {}

  /**
   * Transition vehicle to STALLED state for genuine operational exceptions:
   * (e.g. payment dispute, vehicle problem, inspection issue, equipment failure).
   * Valid entry states: CHECKED_IN or IN_SERVICE.
   */
  async execute(managerUserId: string, input: StallBookingInput): Promise<BookingResponseDTO> {
    const { bookingId, reason } = input

    if (!bookingId || !reason?.trim()) {
      throw new AppError("Booking ID and valid stall reason are required", HTTP_STATUS.BAD_REQUEST)
    }

    const booking = await this.bookingRepository.findById(bookingId)
    if (!booking) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND)
    }

    const allowedEntryStatuses = [BookingStatus.CHECKED_IN, BookingStatus.IN_SERVICE]
    if (!allowedEntryStatuses.includes(booking.status)) {
      throw new AppError(
        `Only CHECKED_IN or IN_SERVICE bookings can enter STALLED state. Current status is ${booking.status}`,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const now = new Date()
    const previousStatus = booking.status

    const stalledData = {
      stalledReason: reason.trim(),
      stalledBy: managerUserId,
      stalledAt: now,
      previousStatus: previousStatus as "CHECKED_IN" | "IN_SERVICE",
    }

    // Atomic MongoDB Transition (CHECKED_IN/IN_SERVICE -> STALLED)
    const updatedDoc = await BookingModel.findOneAndUpdate(
      {
        _id: bookingId,
        status: { $in: allowedEntryStatuses },
      },
      {
        $set: {
          status: BookingStatus.STALLED,
          stalledInfo: stalledData,
          updatedAt: now,
        },
      },
      { new: true }
    )
      .populate("stationId")
      .populate("vehicleId")
      .populate("userId")

    if (!updatedDoc) {
      throw new AppError("Failed to transition booking to STALLED state", HTTP_STATUS.CONFLICT)
    }

    const domainBooking = BookingMapper.toDomain(updatedDoc)

    // Save Audit Log
    const statusLog = new BookingStatusLog({
      id: "",
      bookingId: domainBooking.id,
      fromStatus: previousStatus,
      toStatus: BookingStatus.STALLED,
      changedBy: managerUserId,
      reason: `Booking stalled: ${reason}`,
      createdAt: now,
    })
    await this.bookingStatusLogRepository.save(statusLog)

    // Sync Redis Operational Queue State
    await this.redisQueueService.updateQueueStatus(domainBooking)

    // Dispatch Real-Time Socket Event
    await this.notificationService.notify("BOOKING_STALLED", domainBooking, {
      stalledReason: reason,
      previousStatus,
    })

    return BookingDTOMapper.toDTO(domainBooking)
  }
}
