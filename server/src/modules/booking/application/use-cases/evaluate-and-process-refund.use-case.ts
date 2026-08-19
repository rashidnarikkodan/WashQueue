import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { PaymentStatus } from "../../domain/entities/Booking"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { CreditWalletUseCase } from "@/modules/wallet/application/use-cases/credit-wallet.use-case"
import { IBookingNotificationService } from "../interfaces/booking-notification.interface"
import {
  RefundPolicyEngine,
  RefundPolicyResult,
  Responsibility,
} from "../../domain/services/RefundPolicyEngine"
import logger from "@/configs/logger.config"

export interface ProcessRefundInput {
  bookingId: string
  responsibility?: Responsibility
  reason?: string
}

import { RefundWalletUseCase } from "@/modules/wallet/application/use-cases/refund-wallet.use-case"
import { IEvaluateAndProcessRefundUseCase } from "../interfaces/booking-usecases.interface"

export class EvaluateAndProcessRefundUseCase implements IEvaluateAndProcessRefundUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly creditWalletUseCase?: CreditWalletUseCase,
    private readonly notificationService?: IBookingNotificationService,
    private readonly refundWalletUseCase?: RefundWalletUseCase
  ) {}

  async execute(input: ProcessRefundInput): Promise<RefundPolicyResult> {
    const { bookingId, responsibility = "CUSTOMER", reason } = input

    if (!bookingId) {
      throw new AppError("Booking ID is required for refund processing", HTTP_STATUS.BAD_REQUEST)
    }

    // 1. Idempotency Check: If refund has already been processed, return existing result without duplicate payout!
    const existingRefund = await this.bookingRepository.getRefundDetails(bookingId)
    if (existingRefund && existingRefund.status === "PROCESSED") {
      const domainBooking = await this.bookingRepository.findById(bookingId)
      const depositAmount = domainBooking?.depositAmount || 0
      return {
        refundType: existingRefund.refundType as RefundPolicyResult["refundType"],
        refundMethod: existingRefund.refundMethod as RefundPolicyResult["refundMethod"],
        refundAmount: existingRefund.amount,
        percentage:
          existingRefund.amount > 0
            ? depositAmount > 0
              ? Math.round((existingRefund.amount / depositAmount) * 100)
              : 100
            : 0,
        reason: existingRefund.reason || "Refund previously processed (Idempotent replay)",
      }
    }

    const domainBooking = await this.bookingRepository.findById(bookingId)
    if (!domainBooking) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND)
    }

    const paidAmount =
      domainBooking.paymentStatus === PaymentStatus.PAID
        ? domainBooking.pricingSnapshot?.totalPrice || domainBooking.depositAmount || 0
        : domainBooking.depositAmount || 0

    // 2. Evaluate Policy via Domain Policy Engine
    const policyResult = RefundPolicyEngine.evaluate({
      status: domainBooking.status,
      cancellationReason: reason || domainBooking.cancellation?.cancellationReason || "",
      paymentType: domainBooking.paymentType,
      paymentStatus: domainBooking.paymentStatus,
      paidAmount,
      depositAmount: domainBooking.depositAmount,
      windowStart: domainBooking.scheduling.windowStart,
      responsibility,
      now: new Date(),
    })

    let transactionId: string | null = null

    // 3. Process Wallet Refund if policy dictates refundAmount > 0
    const targetUserId = domainBooking.userId

    const walletExecutor = this.refundWalletUseCase || this.creditWalletUseCase
    if (policyResult.refundAmount > 0 && targetUserId && walletExecutor) {
      try {
        const walletResult = await walletExecutor.execute({
          userId: targetUserId,
          amount: policyResult.refundAmount,
          category: "REFUND",
          description: `Refund (${policyResult.refundType}) for booking #${domainBooking.bookingNumber}`,
          referenceId: domainBooking.id,
          metadata: {
            bookingId: domainBooking.id,
            bookingNumber: domainBooking.bookingNumber,
            refundType: policyResult.refundType,
            reason: policyResult.reason,
          },
        })
        transactionId = walletResult?.id || `tx_refund_${Date.now()}`
      } catch (err) {
        logger.error({ error: err, bookingId: domainBooking.id }, "[Refund] Failed to process wallet refund")
      }
    }

    // 4. Atomically lock refund status to PROCESSED (Idempotency Lock)
    const newPaymentStatus =
      policyResult.refundAmount > 0 && policyResult.refundAmount >= paidAmount
        ? PaymentStatus.REFUNDED
        : domainBooking.paymentStatus

    const updatedBooking = await this.bookingRepository.applyRefund(
      bookingId,
      {
        refundType: policyResult.refundType,
        refundMethod: policyResult.refundMethod,
        status: "PROCESSED",
        amount: policyResult.refundAmount,
        reason: policyResult.reason,
        transactionId,
      },
      newPaymentStatus
    )

    if (updatedBooking && this.notificationService && policyResult.refundAmount > 0) {
      try {
        await this.notificationService.notify("REFUND_COMPLETED", updatedBooking, {
          refundAmount: policyResult.refundAmount,
          refundType: policyResult.refundType,
          reason: policyResult.reason,
        })
      } catch (err) {
        logger.error({ error: err, bookingId: domainBooking.id }, "[Refund] Failed to send refund notification")
      }
    }

    return policyResult
  }
}
