import { Request, Response } from "express"
import Razorpay from "razorpay"
import crypto from "crypto"
import env from "@/configs/env.config"

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
})

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, currency = "INR", receipt } = req.body

    const numericAmount = Number(amount)

    if (isNaN(numericAmount) || numericAmount < 100) {
      res.status(400).json({
        message: "Invalid amount. Minimum amount is 100 paise.",
      })
      return
    }

    const options = {
      amount: numericAmount,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    }

    const order = await razorpay.orders.create(options)

    res.status(200).json({
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    })
  } catch (error: unknown) {
    console.error("Razorpay create order error:", error)
    const err = error as { statusCode?: number; error?: { code?: string }; message?: string }
    if (err?.statusCode === 401 || err?.error?.code === "BAD_REQUEST_ERROR") {
      res.status(401).json({ message: "Authentication failure with payment provider" })
      return
    }
    res.status(500).json({ message: err?.message || "Failed to create Razorpay order" })
  }
}

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      razorpay_order_id,
      order_id,
      razorpay_payment_id,
      payment_id,
      razorpay_signature,
      signature,
    } = req.body

    const targetOrderId = razorpay_order_id || order_id
    const targetPaymentId = razorpay_payment_id || payment_id
    const targetSignature = razorpay_signature || signature

    if (!targetOrderId || !targetPaymentId || !targetSignature) {
      res.status(400).json({
        success: false,
        message: "Missing required verification fields (order_id, payment_id, or signature)",
      })
      return
    }

    const generatedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${targetOrderId}|${targetPaymentId}`)
      .digest("hex")

    const isMatch = crypto.timingSafeEqual(
      Buffer.from(generatedSignature, "utf-8"),
      Buffer.from(targetSignature, "utf-8")
    )

    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: "Payment signature mismatch. Verification failed.",
      })
      return
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order_id: targetOrderId,
      payment_id: targetPaymentId,
    })
  } catch (error: unknown) {
    console.error("Razorpay verify signature error:", error)
    const err = error as { message?: string }
    res.status(500).json({
      success: false,
      message: err?.message || "Failed to verify payment signature",
    })
  }
}
