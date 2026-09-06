import {
  BookingStatus,
  PaymentStatus,
  PaymentMethod,
} from "@/modules/booking/domain/entities/Booking"

export type RefundType = "FULL_REFUND" | "PARTIAL_REFUND" | "NO_REFUND"
export type RefundMethod = "WALLET_REFUND" | "ORIGINAL_PAYMENT_REFUND" | "NONE"
export type Responsibility = "CUSTOMER" | "STATION" | "SYSTEM"

export interface EvaluateRefundInput {
  status: BookingStatus
  cancellationReason?: string
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paidAmount: number
  depositAmount: number
  windowStart: Date
  responsibility: Responsibility
  now?: Date
}

export interface RefundPolicyResult {
  refundType: RefundType
  refundMethod: RefundMethod
  refundAmount: number
  percentage: number
  reason: string
}

export class RefundPolicyEngine {
  static evaluate(input: EvaluateRefundInput): RefundPolicyResult {
    const {
      status,
      cancellationReason = "",
      paymentMethod,
      paymentStatus,
      paidAmount = 0,
      depositAmount = 0,
      windowStart,
      responsibility,
      now = new Date(),
    } = input

    const totalPaid =
      paymentStatus === PaymentStatus.PAID
        ? paidAmount > 0
          ? paidAmount
          : depositAmount
        : depositAmount

    if (
      totalPaid <= 0 ||
      paymentMethod === PaymentMethod.PAY_AT_STATION ||
      paymentMethod === PaymentMethod.NO_PAYMENT
    ) {
      return {
        refundType: "NO_REFUND",
        refundMethod: "NONE",
        refundAmount: 0,
        percentage: 0,
        reason: "No online payment was collected for this booking",
      }
    }

    if (responsibility === "STATION" || responsibility === "SYSTEM") {
      return {
        refundType: "FULL_REFUND",
        refundMethod: "WALLET_REFUND",
        refundAmount: totalPaid,
        percentage: 100,
        reason: `Full refund issued due to ${responsibility.toLowerCase()} cancellation: ${cancellationReason || "Station operational reason"}`,
      }
    }

    if (
      status === BookingStatus.IN_SERVICE ||
      status === BookingStatus.SERVICE_COMPLETED ||
      status === BookingStatus.AWAITING_HANDOVER ||
      status === BookingStatus.COMPLETED
    ) {
      return {
        refundType: "NO_REFUND",
        refundMethod: "NONE",
        refundAmount: 0,
        percentage: 0,
        reason: "Service has already commenced or completed; non-refundable",
      }
    }

    if (status === BookingStatus.NO_SHOW) {
      return {
        refundType: "NO_REFUND",
        refundMethod: "NONE",
        refundAmount: 0,
        percentage: 0,
        reason: "Deposit forfeited due to missed arrival window (NO_SHOW)",
      }
    }

    const windowStartMs = new Date(windowStart).getTime()
    const hoursRemaining = (windowStartMs - now.getTime()) / (1000 * 60 * 60)

    if (hoursRemaining >= 24) {
      return {
        refundType: "FULL_REFUND",
        refundMethod: "WALLET_REFUND",
        refundAmount: totalPaid,
        percentage: 100,
        reason: "Full refund issued for cancellation made more than 24 hours prior to booking",
      }
    } else if (hoursRemaining >= 2) {
      const partialAmount = Math.round(totalPaid * 0.5)
      return {
        refundType: "PARTIAL_REFUND",
        refundMethod: "WALLET_REFUND",
        refundAmount: partialAmount,
        percentage: 50,
        reason:
          "50% partial refund issued for cancellation made between 2 and 24 hours prior to booking",
      }
    } else {
      return {
        refundType: "NO_REFUND",
        refundMethod: "NONE",
        refundAmount: 0,
        percentage: 0,
        reason: "Late cancellation made less than 2 hours prior to booking; deposit non-refundable",
      }
    }
  }
}
