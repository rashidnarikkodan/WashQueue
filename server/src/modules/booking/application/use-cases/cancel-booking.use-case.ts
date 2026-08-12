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
import { CreditWalletUseCase } from "@/modules/wallet/application/use-cases/credit-wallet.use-case"

export class CancelBookingUseCase implements ICancelBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly redisQueueService: IBookingQueueService,
    private readonly notificationService: IBookingNotificationService,
    private readonly creditWalletUseCase?: CreditWalletUseCase
  ) {}

  async execute(userId: string, input: CancelBookingInput): Promise<BookingResponseDTO> {
    const booking = await this.bookingRepository.findById(input.bookingId)
    if (!booking) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND)
    }

    // Rule 1: Cancellation can only happen before arrival / check-in
    if (
      booking.status === BookingStatus.CHECKED_IN ||
      booking.checkedInAt ||
      booking.status === BookingStatus.IN_SERVICE ||
      booking.status === BookingStatus.SERVICE_COMPLETED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      throw new AppError(
        "Booking cannot be cancelled after arrival or check-in",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    // Rule 2: Cancellation can only happen at least 24 hours (1 day) before the scheduled booking time
    const now = new Date()
    const scheduledTime = new Date(booking.scheduling.windowStart).getTime()
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000

    if (scheduledTime - now.getTime() < twentyFourHoursInMs) {
      throw new AppError(
        "Cancellations are only allowed at least 24 hours prior to the scheduled booking time",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    if (!booking.canTransitionTo(BookingStatus.CANCELLED)) {
      throw new AppError(
        `Booking in status ${booking.status} cannot be cancelled`,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const fromStatus = booking.status
    const refundAmount =
      booking.pricingSnapshot?.totalPrice && booking.pricingSnapshot.totalPrice > 0
        ? booking.pricingSnapshot.totalPrice
        : booking.depositAmount > 0
        ? booking.depositAmount
        : 0

    booking.cancel(input.reason, userId, refundAmount)
    const updatedBooking = await this.bookingRepository.update(booking)

    // Execute automatic refund to user's Wallet
    const targetUserId = booking.userId || userId
    if (refundAmount > 0 && targetUserId && this.creditWalletUseCase) {
      try {
        await this.creditWalletUseCase.execute({
          userId: targetUserId,
          amount: refundAmount,
          category: "REFUND",
          description: `Refund for cancelled booking #${booking.bookingNumber}`,
          referenceId: booking.id,
          metadata: {
            bookingId: booking.id,
            bookingNumber: booking.bookingNumber,
            cancellationReason: input.reason,
          },
        })
      } catch (refundError) {
        console.error(
          `Failed to credit refund to user wallet for booking ${booking.id}:`,
          refundError
        )
      }
    }

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
