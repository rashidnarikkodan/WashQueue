import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { BookingStatus } from "../../domain/entities/Booking"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "../../domain/repositories/booking-status-log.repository"
import { BookingStatusLog } from "../../domain/entities/BookingStatusLog"
import { IBookingQueueService } from "../interfaces/booking-queue.interface"
import { IBookingNotificationService } from "../interfaces/booking-notification.interface"
import { BookingDTOMapper } from "../mappers/booking-dto.mapper"
import { CancelBookingInput } from "../dtos/cancel-booking.dto"
import { BookingResponseDTO } from "../dtos/booking-response.dto"
import { ICancelBookingUseCase } from "../interfaces/booking-usecases.interface"

export class CancelBookingUseCase implements ICancelBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly redisQueueService: IBookingQueueService,
    private readonly notificationService: IBookingNotificationService
  ) {}

  async execute(userId: string, input: CancelBookingInput): Promise<BookingResponseDTO> {
    const booking = await this.bookingRepository.findById(input.bookingId)
    if (!booking) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND)
    }

    if (!booking.canTransitionTo(BookingStatus.CANCELLED)) {
      throw new AppError(
        `Booking in status ${booking.status} cannot be cancelled`,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const fromStatus = booking.status
    const refundAmount = booking.depositAmount > 0 ? booking.depositAmount : 0

    booking.cancel(input.reason, userId, refundAmount)
    const updatedBooking = await this.bookingRepository.update(booking)

    // Save audit log
    const statusLog = new BookingStatusLog({
      id: "",
      bookingId: updatedBooking.id,
      fromStatus,
      toStatus: BookingStatus.CANCELLED,
      changedBy: userId,
      reason: input.reason,
      createdAt: new Date(),
    })
    await this.bookingStatusLogRepository.save(statusLog)

    // Sync Redis queue
    await this.redisQueueService.updateQueueStatus(updatedBooking)

    // Notify
    await this.notificationService.notify("BOOKING_CANCELLED", updatedBooking)

    return BookingDTOMapper.toDTO(updatedBooking)
  }
}
