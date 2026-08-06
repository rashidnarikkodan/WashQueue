import { api } from "@/shared/config/axios"
import { API_ROUTES } from "@/shared/constants/api.const"
import { handleApiError } from "@/shared/utils/handleApiError"

export interface CreateOrderInput {
  amount: number // in paise
  currency?: string
  receipt?: string
}

export interface CreateOrderResponse {
  order_id: string
  id: string
  amount: number
  currency: string
  receipt?: string
}

export interface VerifyPaymentInput {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface VerifyPaymentResponse {
  success: boolean
  message: string
  order_id?: string
  payment_id?: string
}

export const paymentApi = {
  async createOrder(input: CreateOrderInput): Promise<CreateOrderResponse> {
    try {
      const response = await api.post<CreateOrderResponse>(
        API_ROUTES.PAYMENT.CREATE_ORDER,
        input
      )
      return response.data
    } catch (error) {
      throw handleApiError(error, "Failed to create payment order")
    }
  },

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResponse> {
    try {
      const response = await api.post<VerifyPaymentResponse>(
        API_ROUTES.PAYMENT.VERIFY_PAYMENT,
        input
      )
      return response.data
    } catch (error) {
      throw handleApiError(error, "Failed to verify payment signature")
    }
  },
}
