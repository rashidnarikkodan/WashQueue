import crypto from "crypto"
import env from "@/configs/env.config"
import { IPaymentSignatureVerifier } from "../../application/interfaces/payment-signature-verifier.interface"

function timingSafeEqualStrings(expected: string, actual: string): boolean {
  const bufExpected = Buffer.from(expected, "utf-8")
  const bufActual = Buffer.from(actual || "", "utf-8")
  return bufExpected.length === bufActual.length && crypto.timingSafeEqual(bufExpected, bufActual)
}

export class RazorpaySignatureVerifier implements IPaymentSignatureVerifier {
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex")
    return timingSafeEqualStrings(expectedSignature, signature)
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const webhookSecret = env.RAZORPAY_KEY_SECRET
    if (!webhookSecret || !signature) return false
    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex")
    return timingSafeEqualStrings(expectedSignature, signature)
  }
}
