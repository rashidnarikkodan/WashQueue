export interface IPaymentSignatureVerifier {
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean
  verifyWebhookSignature(rawBody: string, signature: string): boolean
}
