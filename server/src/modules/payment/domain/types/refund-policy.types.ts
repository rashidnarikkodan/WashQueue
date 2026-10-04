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
