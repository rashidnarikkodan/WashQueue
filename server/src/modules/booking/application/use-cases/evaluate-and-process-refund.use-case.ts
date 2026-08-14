import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { BookingStatus, PaymentStatus } from "../../domain/entities/Booking"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { CreditWalletUseCase } from "@/modules/wallet/application/use-cases/credit-wallet.use-case"
import { IBookingNotificationService } from "../interfaces/booking-notification.interface"
import {
  RefundPolicyEngine,
  RefundPolicyResult,
  Responsibility,
} from "../../domain/services/RefundPolicyEngine"
import { BookingModel } from "../../infrastructure/models/booking.model"
import { BookingMapper } from "../../infrastructure/mappers/booking.mapper"

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

    const doc = await BookingModel.findById(bookingId).populate("userId").exec()
    if (!doc) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND)
    }

    // 1. Idempotency Check: If refund has already been processed, return existing result without duplicate payout!
    if (doc.refundDetails && doc.refundDetails.status === "PROCESSED") {
      const existingAmount = doc.refundDetails.amount || 0
      return {
        refundType: doc.refundDetails.refundType as any,
        refundMethod: doc.refundDetails.refundMethod as any,
        refundAmount: existingAmount,
        percentage: existingAmount > 0 ? (doc.depositAmount > 0 ? Math.round((existingAmount / doc.depositAmount) * 100) : 100) : 0,
        reason: doc.refundDetails.reason || "Refund previously processed (Idempotent replay)",
      }
    }

    const domainBooking = BookingMapper.toDomain(doc)
    const paidAmount =
      doc.paymentStatus === PaymentStatus.PAID
        ? doc.pricingSnapshot?.totalPrice || doc.depositAmount || 0
        : doc.depositAmount || 0

    // 2. Evaluate Policy via Domain Policy Engine
    const policyResult = RefundPolicyEngine.evaluate({
      status: domainBooking.status,
      cancellationReason: reason || doc.cancellation?.cancellationReason || "",
      paymentType: domainBooking.paymentType,
      paymentStatus: domainBooking.paymentStatus,
      paidAmount,
      depositAmount: domainBooking.depositAmount,
      windowStart: domainBooking.scheduling.windowStart,
      responsibility,
      now: new Date(),
    })

    const now = new Date()
    let transactionId: string | null = null

    // 3. Process Wallet Refund if policy dictates refundAmount > 0
    const targetUserId = domainBooking.userId || (doc.userId ? doc.userId._id?.toString() : null)

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
        console.error(`Failed to process wallet refund for booking ${domainBooking.id}:`, err)
      }
    }

    // 4. Atomic MongoDB Update: Lock refund status to PROCESSED (Idempotency Lock)
    const newPaymentStatus =
      policyResult.refundAmount > 0 && policyResult.refundAmount >= paidAmount
        ? PaymentStatus.REFUNDED
        : doc.paymentStatus

    const updatedDoc = await BookingModel.findOneAndUpdate(
      {
        _id: bookingId,
        "refundDetails.status": { $ne: "PROCESSED" },
      },
      {
        $set: {
          refundAmount: policyResult.refundAmount,
          paymentStatus: newPaymentStatus,
          refundDetails: {
            refundType: policyResult.refundType,
            refundMethod: policyResult.refundMethod,
            status: "PROCESSED",
            amount: policyResult.refundAmount,
            reason: policyResult.reason,
            processedAt: now,
            transactionId,
          },
          updatedAt: now,
        },
      },
      { new: true }
    )

    if (updatedDoc && this.notificationService && policyResult.refundAmount > 0) {
      try {
        const updatedDomain = BookingMapper.toDomain(updatedDoc)
        await this.notificationService.notify("REFUND_COMPLETED", updatedDomain, {
          refundAmount: policyResult.refundAmount,
          refundType: policyResult.refundType,
          reason: policyResult.reason,
        })
      } catch (e) {
        console.error("Failed to send refund notification:", e)
      }
    }

    return policyResult
  }
}
