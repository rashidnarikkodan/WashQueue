import crypto from "crypto"
import Razorpay from "razorpay"
import env from "@/configs/env.config"
import { IWalletPaymentGateway } from "../../application/interfaces/wallet-payment-gateway.interface"
import { TopUpOrderDTO } from "../../application/dtos/wallet.dto"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"

export class RazorpayWalletPaymentService implements IWalletPaymentGateway {
  private razorpay: Razorpay

  constructor() {
    this.razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    })
  }

  public async createTopUpOrder(
    userId: string,
    amount: number,
    currency: string = "INR"
  ): Promise<TopUpOrderDTO> {
    try {
      // Razorpay expects amount in paise (1 INR = 100 paise)
      const amountInPaise = Math.round(amount * 100)
      const receipt = `w_topup_${userId.slice(-6)}_${Date.now()}`

      const options = {
        amount: amountInPaise,
        currency: currency.toUpperCase(),
        receipt,
        notes: {
          userId,
          purpose: "WALLET_TOP_UP",
        },
      }

      const order = await this.razorpay.orders.create(options)

      return {
        orderId: order.id,
        amount,
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

  public verifyTopUpSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    if (!orderId || !paymentId || !signature) {
      return false
    }

    try {
      const generatedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest("hex")

      return generatedSignature === signature
    } catch (error) {
      console.error("Razorpay signature verification error:", error)
      return false
    }
  }
}
