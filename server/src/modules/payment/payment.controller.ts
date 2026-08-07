import { Request, Response } from "express"
import Razorpay from "razorpay"
import env from "@/configs/env.config"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import {
  createBookingReservationUseCase,
  confirmBookingReservationUseCase,
  cancelBookingReservationUseCase,
  processRazorpayWebhookUseCase,
  cleanupExpiredReservationsUseCase,
} from "../booking/booking.module"

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
})

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { stationId, vehicleId, timeWindowId, serviceType } = req.body
    const userObj = (req as Request & { user?: { userId?: string; id?: string } }).user
    const userId = userObj?.userId || userObj?.id || req.body.userId

    // Trigger cleanup of any expired held reservations before checking/reserving
    cleanupExpiredReservationsUseCase.execute().catch((err) => {
      console.error("Error during background reservation cleanup:", err)
    })

    // If request contains booking intent parameters, run Atomic Reservation Flow
    if (stationId && timeWindowId && serviceType) {
      if (!userId) {
        res.status(401).json({ success: false, message: "User authentication required" })
        return
      }

      const result = await createBookingReservationUseCase.execute(userId, {
        stationId,
        vehicleId,
        timeWindowId,
        serviceType,
        extraServiceIds: req.body.extraServiceIds,
        paymentType: req.body.paymentType || "ONLINE_FULL",
      })

      res.status(200).json({
        success: true,
        order_id: result.razorpayOrderId,
        id: result.razorpayOrderId,
        amount: result.amount,
        currency: result.currency,
        reservation_id: result.reservationId,
        expires_at: result.expiresAt,
      })
      return
    }

    // Direct fallback for simple amount order creation
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
      success: true,
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    })
  } catch (error: unknown) {
    if (error instanceof AppError) {
      if (error.message === "SLOT_UNAVAILABLE" || error.statusCode === HTTP_STATUS.CONFLICT) {
        res.status(409).json({
          success: false,
          code: "SLOT_UNAVAILABLE",
          message: "Selected time window is no longer available or is full.",
        })
        return
      }
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      })
      return
    }

    console.error("Razorpay create order error:", error)
    const err = error as { statusCode?: number; error?: { code?: string }; message?: string }
    res.status(500).json({ success: false, message: err?.message || "Failed to create Razorpay order" })
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

    const bookingDto = await confirmBookingReservationUseCase.execute({
      razorpay_order_id: targetOrderId,
      razorpay_payment_id: targetPaymentId,
      razorpay_signature: targetSignature,
    })

    res.status(200).json({
      success: true,
      message: "Payment verified and booking confirmed successfully",
      booking: bookingDto,
      order_id: targetOrderId,
      payment_id: targetPaymentId,
    })
  } catch (error: unknown) {
    if (error instanceof AppError) {
      if (error.message === "RESERVATION_EXPIRED_REFUND_INITIATED") {
        res.status(400).json({
          success: false,
          code: "RESERVATION_EXPIRED_REFUND_INITIATED",
          message: error.details || "Your payment succeeded, but the 10-minute hold expired. A refund has been automatically initiated for your payment.",
        })
        return
      }
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      })
      return
    }

    console.error("Razorpay verify signature error:", error)
    const err = error as { message?: string }
    res.status(500).json({
      success: false,
      message: err?.message || "Failed to verify payment signature",
    })
  }
}

export const cancelReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const reservationId = req.params.id || req.body.reservationId
    const userObj = (req as Request & { user?: { userId?: string; id?: string } }).user
    const userId = userObj?.userId || userObj?.id || req.body.userId

    if (reservationId && userId) {
      await cancelBookingReservationUseCase.execute(reservationId, userId)
    }

    res.status(200).json({ success: true, message: "Reservation cancelled successfully" })
  } catch (error: unknown) {
    console.error("Cancel reservation error:", error)
    res.status(500).json({ success: false, message: "Failed to cancel reservation" })
  }
}

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string
    const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body)

    const result = await processRazorpayWebhookUseCase.execute(rawBody, signature)
    res.status(200).json(result)
  } catch (error: unknown) {
    console.error("Razorpay webhook processing error:", error)
    res.status(200).json({ success: false, message: "Webhook error handled" })
  }
}
