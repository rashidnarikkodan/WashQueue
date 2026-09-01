import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { BookingStatus } from "../../domain/entities/Booking"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "../../domain/repositories/booking-status-log.repository"
import { BookingStatusLog } from "../../domain/entities/BookingStatusLog"
import { IBookingQueueService } from "@/modules/queue/application/interfaces/booking-queue.interface"
import { IBookingNotificationService } from "@/modules/notification/notification.module"
import { BookingDTOMapper } from "../mappers/booking-dto.mapper"
import { CancelBookingInput } from "../dtos/cancel-booking.dto"
import { BookingResponseDTO } from "../dtos/booking-response.dto"
import { ICancelBookingUseCase } from "../interfaces/booking-usecases.interface"
import type { IEvaluateAndProcessRefundUseCase } from "@/modules/payment/application/interfaces/payment-usecases.interface"
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
