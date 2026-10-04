import type { PaymentMethod } from "@/shared/constants/payment.constants"
import type { BookingResponse } from "./booking.types"
export interface CreateOrderInput {
  amount: number
  currency?: string
  receipt?: string
  stationId?: string
  vehicleId?: string
  timeWindowId?: string
  serviceType?: "HALF" | "FULL"
  extraServiceIds?: string[]
  paymentMethod?: Extract<PaymentMethod, "ONLINE" | "PAY_AT_STATION">
  useWallet?: boolean
}

export interface CreateOrderResponse {
  success?: boolean
  order_id: string
  id: string
  amount: number
  currency: string
  receipt?: string
  reservation_id?: string
  wallet_amount?: number
  expires_at?: string
  code?: string
  message?: string
}

export interface VerifyPaymentInput {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  paymentMethod?: PaymentMethod
}

export interface VerifyPaymentResponse {
  success: boolean
  message: string
  order_id?: string
  payment_id?: string
  booking?: BookingResponse
  code?: string
}
