export interface CreatePaymentOrderParams {
  amountInPaise: number
  currency?: string
  receipt?: string
}

export interface PaymentOrderResult {
  orderId: string
  amount: number
  currency: string
}

export interface IPaymentGatewayService {
  createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult>
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean
  verifyWebhookSignature(rawBody: string, signature: string): boolean
}