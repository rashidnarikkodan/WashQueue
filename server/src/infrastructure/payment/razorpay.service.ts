import crypto from "crypto"
import Razorpay from "razorpay"
import env from "@/configs/env.config"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import {
  IPaymentGatewayService,
  CreatePaymentOrderParams,
  PaymentOrderResult,
} from "@/core/application/interfaces/payment-gateway.interface"
import { IWalletPaymentGateway } from "@/modules/wallet/application/interfaces/wallet-payment-gateway.interface"
import { TopUpOrderDTO } from "@/modules/wallet/application/dtos/wallet.dto"

function timingSafeEqualStrings(expected: string, actual: string): boolean {
  const bufExpected = Buffer.from(expected, "utf-8")
  const bufActual = Buffer.from(actual || "", "utf-8")
  return bufExpected.length === bufActual.length && crypto.timingSafeEqual(bufExpected, bufActual)
}

export class SharedRazorpayService implements IPaymentGatewayService, IWalletPaymentGateway {
  private razorpay: Razorpay

  constructor() {
    this.razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    })
  }

  async createOrder({
    amountInPaise,
    currency = "INR",
    receipt,
  }: CreatePaymentOrderParams): Promise<PaymentOrderResult> {
    try {
      const order = await this.razorpay.orders.create({
        amount: amountInPaise,
        currency: currency.toUpperCase(),
        receipt: receipt || `rcpt_${Date.now()}`,
      })

      return {
        orderId: order.id,
        amount: Number(order.amount),
        currency: order.currency,
      }
    } catch (error) {
      console.error("Razorpay order creation failed:", error)
      throw new AppError(
        "Failed to initiate payment order with payment gateway",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }
  }

  async createTopUpOrder(
    userId: string,
    amountInRupees: number,
    currency: string = "INR"
  ): Promise<TopUpOrderDTO> {
    try {
      const amountInPaise = Math.round(amountInRupees * 100)
      const receipt = `w_topup_${userId.slice(-6)}_${Date.now()}`

      const order = await this.razorpay.orders.create({
        amount: amountInPaise,
        currency: currency.toUpperCase(),
        receipt,
        notes: {
          userId,
          purpose: "WALLET_TOP_UP",
        },
      })

      return {
        orderId: order.id,
        amount: amountInRupees,
        currency: order.currency,
        receipt: order.receipt || receipt,
        keyId: env.RAZORPAY_KEY_ID,
      }
    } catch (error) {
      console.error("Razorpay wallet topup order creation failed:", error)
      throw new AppError(
        "Failed to initiate payment with payment gateway",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }
  }

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    if (!orderId || !paymentId || !signature) {
      return false
    }

    try {
      const expectedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest("hex")

      return timingSafeEqualStrings(expectedSignature, signature)
    } catch (error) {
      console.error("Razorpay signature verification error:", error)
      return false
    }
  }

  verifyTopUpSignature(orderId: string, paymentId: string, signature: string): boolean {
    return this.verifyPaymentSignature(orderId, paymentId, signature)
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const webhookSecret = env.RAZORPAY_KEY_SECRET
    if (!webhookSecret || !signature) return false

    try {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex")

      return timingSafeEqualStrings(expectedSignature, signature)
    } catch (error) {
      console.error("Razorpay webhook signature verification error:", error)
      return false
    }
  }
}

export const sharedRazorpayService = new SharedRazorpayService()
