import { IStallBookingUseCase } from "../interfaces/queue-usecases.interface"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { BookingStatus } from "@/modules/booking/domain/entities/Booking"
import { IBookingRepository } from "@/modules/booking/domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "@/modules/booking/domain/repositories/booking-status-log.repository"
import { BookingStatusLog } from "@/modules/booking/domain/entities/BookingStatusLog"
import { IBookingQueueService } from "../interfaces/booking-queue.interface"
import { IBookingNotificationService } from "@/modules/notification/notification.module"
import { BookingDTOMapper } from "@/modules/booking/application/mappers/booking-dto.mapper"
import { BookingResponseDTO } from "@/modules/booking/application/dtos/booking-response.dto"

export interface StallBookingInput {
  bookingId: string
  reason: string
}

export class StallBookingUseCase implements IStallBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly redisQueueService: IBookingQueueService,
    private readonly notificationService: IBookingNotificationService
  ) {}

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

    const previousStatus = booking.status

    booking.stall(reason.trim(), managerUserId)

    const domainBooking = await this.bookingRepository.updateWithStatusGuard(
      booking,
      allowedEntryStatuses
    )

    if (!domainBooking) {
      throw new AppError("Failed to transition booking to STALLED state", HTTP_STATUS.CONFLICT)
    }

    const now = domainBooking.stalledInfo?.stalledAt || new Date()

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

    await this.redisQueueService.updateQueueStatus(domainBooking)

    await this.notificationService.notify("BOOKING_STALLED", domainBooking, {
      stalledReason: reason,
      previousStatus,
    })

    return BookingDTOMapper.toDTO(domainBooking)
  }
}
