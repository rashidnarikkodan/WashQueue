import { api } from "@/shared/config/axios"
import { API_ROUTES } from "@/shared/constants/api.const"
import { handleApiError } from "@/shared/utils/handleApiError"
import type { BookingResponse } from "@/shared/apis/booking.api"
import type { PaymentType, PaymentMethod } from "@/shared/constants/payment.constants"

export interface CreateOrderInput {
  amount: number // in paise
  currency?: string
  receipt?: string
  stationId?: string
  vehicleId?: string
  timeWindowId?: string
  serviceType?: "HALF" | "FULL"
  extraServiceIds?: string[]
  paymentType?: Extract<PaymentType, "ONLINE_FULL" | "PAY_AT_STATION">
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

export const paymentApi = {
  async createOrder(input: CreateOrderInput): Promise<CreateOrderResponse> {
    try {
      const response = await api.post<{ success: boolean; message: string; data: CreateOrderResponse }>(
        API_ROUTES.PAYMENT.CREATE_ORDER,
        input
      )
      return response.data.data ?? (response.data as unknown as CreateOrderResponse)
    } catch (error) {
      throw handleApiError(error, "Failed to create payment order")
    }
  },

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResponse> {
    try {
      const response = await api.post<{
        success: boolean
        message: string
        data: {
          booking: BookingResponse
          order_id: string
          payment_id: string
        }
      }>(API_ROUTES.PAYMENT.VERIFY_PAYMENT, input)

      const payload = response.data.data
      if (payload) {
        return {
          success: response.data.success ?? true,
          message: response.data.message ?? "Payment verified successfully",
          ...payload,
        }
      }
      return response.data as unknown as VerifyPaymentResponse
    } catch (error) {
      throw handleApiError(error, "Failed to verify payment signature")
    }
  },

  async cancelReservation(reservationId: string): Promise<void> {
    try {
      await api.post(`/payment/reservations/${reservationId}/cancel`)
    } catch (error) {
      console.warn("Failed to cancel reservation on server:", error)
    }
  },
}
