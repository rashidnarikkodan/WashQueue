import { Responsibility } from "../../domain/services/RefundPolicyEngine"
import { PaymentMethod } from "@/modules/booking/domain/entities/Booking"

export interface RazorpayWebhookPayload {
  event: string
  payload: {
    payment?: {
      entity: {
        id: string
        order_id: string
        amount: number
        status: string
      }
    }
    order?: {
      entity: {
        id: string
        amount: number
        status: string
      }
    }
  }
}

export interface CreateBookingReservationInput {
  stationId: string
  vehicleId: string
  timeWindowId: string
  serviceType: "HALF" | "FULL"
  extraServiceIds?: string[]
  paymentMethod: "ONLINE" | "PAY_AT_STATION"
  useWallet?: boolean
}

export interface BookingReservationResponseDTO {
  reservationId: string
  paymentOrderId: string
  amount: number
  walletAmount?: number
  currency: string
  expiresAt: string
}

export interface ConfirmBookingReservationInput {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  paymentMethod?: PaymentMethod
  skipSignatureVerification?: boolean
}

export interface ProcessRefundInput {
  bookingId: string
  responsibility?: Responsibility
  reason?: string
}
