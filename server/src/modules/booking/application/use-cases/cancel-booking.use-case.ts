import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { BookingStatus, PaymentStatus } from "../../domain/entities/Booking"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "../../domain/repositories/booking-status-log.repository"
import { BookingStatusLog } from "../../domain/entities/BookingStatusLog"
import { IBookingQueueService } from "../interfaces/booking-queue.interface"
import { IBookingNotificationService } from "../interfaces/booking-notification.interface"
import { BookingDTOMapper } from "../mappers/booking-dto.mapper"
import { CancelBookingInput } from "../dtos/cancel-booking.dto"
import { BookingResponseDTO } from "../dtos/booking-response.dto"
import { Booking } from "../../domain/entities/Booking"
import { ICancelBookingUseCase, IEvaluateAndProcessRefundUseCase } from "../interfaces/booking-usecases.interface"
import { CreditWalletUseCase } from "@/modules/wallet/application/use-cases/credit-wallet.use-case"
import { ITransactionRunner } from "@/core/domain/transaction.interface"

export class CancelBookingUseCase implements ICancelBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly redisQueueService: IBookingQueueService,
    private readonly notificationService: IBookingNotificationService,
    private readonly evaluateAndProcessRefundUseCase?: IEvaluateAndProcessRefundUseCase,
    private readonly transactionRunner?: ITransactionRunner
  ) {}

  private calculateRefundAmount(
    booking: Booking,
    isStaffCancellation: boolean,
    now: Date
  ): number {
    const paidAmount =
      booking.paymentStatus === PaymentStatus.PAID
        ? booking.pricingSnapshot?.totalPrice || booking.depositAmount || 0
        : booking.depositAmount || 0

    if (paidAmount <= 0) return 0
    if (isStaffCancellation) return paidAmount

    const windowStartMs = new Date(booking.scheduling.windowStart).getTime()
    const hoursRemaining = (windowStartMs - now.getTime()) / (1000 * 60 * 60)

    if (hoursRemaining >= 24) {
      return paidAmount
    } else if (hoursRemaining >= 2) {
      return Math.round(paidAmount * 0.5)
    } else {
      return 0
    }
  }

  async execute(
    userId: string,
    input: CancelBookingInput,
    userRole?: string
  ): Promise<BookingResponseDTO> {
    const booking = await this.bookingRepository.findById(input.bookingId)
    if (!booking) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND)
    }

    if (
      booking.status === BookingStatus.IN_SERVICE ||
      booking.status === BookingStatus.SERVICE_COMPLETED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      throw new AppError(
        "Booking cannot be cancelled after wash service has started or completed",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.NO_SHOW) {
      throw new AppError(`Booking is already ${booking.status.toLowerCase()}`, HTTP_STATUS.BAD_REQUEST)
    }

    const isStaffCancellation =
      userRole === "MANAGER" || userRole === "OWNER" || userRole === "ADMIN"

    const now = new Date()
    const fromStatus = booking.status

    const cancellationReason =
      input.reason || (isStaffCancellation ? "Cancelled by station manager" : "Cancelled by customer")

    booking.cancel(cancellationReason, userId)

    const runCancellationWork = async (session?: unknown) => {
      const updated = await this.bookingRepository.updateWithStatusGuard(
        booking,
        [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN],
        session
      )
      if (!updated) return null

      const statusLog = new BookingStatusLog({
        id: "",
        bookingId: updated.id,
        fromStatus,
        toStatus: BookingStatus.CANCELLED,
        changedBy: userId,
        reason: cancellationReason,
        createdAt: now,
      })
      await this.bookingStatusLogRepository.save(statusLog, session)

      return updated
    }

    const domainBooking = this.transactionRunner
      ? await this.transactionRunner.runInTransaction(runCancellationWork)
      : await runCancellationWork()

    if (!domainBooking) {
      throw new AppError(
        "Cancellation failed. Booking may have already been cancelled or in service.",
        HTTP_STATUS.CONFLICT
      )
    }

    const responsibility = isStaffCancellation ? "STATION" : "CUSTOMER"
    if (this.evaluateAndProcessRefundUseCase) {
      await this.evaluateAndProcessRefundUseCase.execute({
        bookingId: domainBooking.id,
        responsibility,
        reason: cancellationReason,
      })
    }

    await this.redisQueueService.updateQueueStatus(domainBooking)

    await this.notificationService.notify("BOOKING_CANCELLED", domainBooking)

    return BookingDTOMapper.toDTO(domainBooking)
  }
}
