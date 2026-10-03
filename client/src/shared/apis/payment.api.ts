/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  CreateOrderInput,
  CreateOrderResponse,
  VerifyPaymentInput,
  VerifyPaymentResponse,
} from "../types/payment.types"
export * from "../types/payment.types"
import { api } from "@/shared/config/axios"
import { API_ROUTES } from "@/shared/constants/api.const"
import { handleApiError } from "@/shared/utils/handleApiError"
import type { BookingResponse } from "@/shared/apis/booking.api"

export const paymentApi = {
  async createOrder(input: CreateOrderInput): Promise<CreateOrderResponse> {
    try {
      const response = await api.post<{
        success: boolean
        message: string
        data: CreateOrderResponse
      }>(API_ROUTES.PAYMENT.CREATE_ORDER, input)
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
      handleApiError(error, "Failed to cancel reservation on server")
    }
  },
}
