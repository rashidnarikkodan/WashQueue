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
import { ICancelBookingUseCase } from "../interfaces/booking-usecases.interface"
import { CreditWalletUseCase } from "@/modules/wallet/application/use-cases/credit-wallet.use-case"
import { BookingModel } from "../../infrastructure/models/booking.model"
import { EvaluateAndProcessRefundUseCase } from "./evaluate-and-process-refund.use-case"

import { BookingMapper } from "../../infrastructure/mappers/booking.mapper"

export class CancelBookingUseCase implements ICancelBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly redisQueueService: IBookingQueueService,
    private readonly notificationService: IBookingNotificationService,
    private readonly creditWalletUseCase?: CreditWalletUseCase,
    private readonly evaluateAndProcessRefundUseCase?: EvaluateAndProcessRefundUseCase
  ) {}

  /**
   * Domain Refund Calculation Engine:
   * - Manager / Owner cancellation -> 100% Full Refund
   * - Customer >24h before windowStart -> 100% Full Refund
   * - Customer 2h-24h before windowStart -> 50% Partial Refund
   * - Customer <2h before windowStart -> 0% Non-refundable late cancellation
   */
  private calculateRefundAmount(
    booking: any,
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
      return paidAmount // 100% full refund
    } else if (hoursRemaining >= 2) {
      return Math.round(paidAmount * 0.5) // 50% partial refund
    } else {
      return 0 // 0% non-refundable late cancellation
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

    // Rule 1: Service state check — cancellation prohibited once service has started
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

    const cancellationData = {
      cancellationReason: input.reason || (isStaffCancellation ? "Cancelled by station manager" : "Cancelled by customer"),
      cancelledBy: userId,
      cancelledAt: now,
    }

    // Rule 2: Atomic MongoDB Transition (PENDING/CONFIRMED/CHECKED_IN -> CANCELLED) to prevent duplicate cancellations
    const updatedDoc = await BookingModel.findOneAndUpdate(
      {
        _id: input.bookingId,
        status: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
      },
      {
        $set: {
          status: BookingStatus.CANCELLED,
          cancellation: cancellationData,
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
        "Cancellation failed. Booking may have already been cancelled or in service.",
        HTTP_STATUS.CONFLICT
      )
    }

    const domainBooking = BookingMapper.toDomain(updatedDoc)

    const responsibility = isStaffCancellation ? "STATION" : "CUSTOMER"
    let processedRefundAmount = 0

    if (this.evaluateAndProcessRefundUseCase) {
      const refundResult = await this.evaluateAndProcessRefundUseCase.execute({
        bookingId: domainBooking.id,
        responsibility,
        reason: cancellationData.cancellationReason,
      })
      processedRefundAmount = refundResult.refundAmount
    }

    // Rule 5: Audit log
    const statusLog = new BookingStatusLog({
      id: "",
      bookingId: domainBooking.id,
      fromStatus,
      toStatus: BookingStatus.CANCELLED,
      changedBy: userId,
      reason: cancellationData.cancellationReason,
      createdAt: now,
    })
    await this.bookingStatusLogRepository.save(statusLog)

    // Rule 6: Synchronize Redis operational queue
    await this.redisQueueService.updateQueueStatus(domainBooking)

    // Rule 7: Real-time notification
    await this.notificationService.notify("BOOKING_CANCELLED", domainBooking)

    return BookingDTOMapper.toDTO(domainBooking)
  }
}
