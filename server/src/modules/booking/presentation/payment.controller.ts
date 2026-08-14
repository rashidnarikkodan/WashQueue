import { Request, Response } from "express"
import Razorpay from "razorpay"
import env from "@/configs/env.config"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import {
  ICreateBookingReservationUseCase,
  IConfirmBookingReservationUseCase,
  ICancelBookingReservationUseCase,
  IProcessRazorpayWebhookUseCase,
  ICleanupExpiredReservationsUseCase,
} from "../application/interfaces/booking-usecases.interface"

interface AuthenticatedRequest extends Request {
  user?: {
    userId?: string
    id?: string
    role?: string
  }
}

export class PaymentController {
  private readonly razorpay: Razorpay

  constructor(
    private readonly createBookingReservationUseCase: ICreateBookingReservationUseCase,
    private readonly confirmBookingReservationUseCase: IConfirmBookingReservationUseCase,
    private readonly cancelBookingReservationUseCase: ICancelBookingReservationUseCase,
    private readonly processRazorpayWebhookUseCase: IProcessRazorpayWebhookUseCase,
    private readonly cleanupExpiredReservationsUseCase: ICleanupExpiredReservationsUseCase
  ) {
    this.razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    })
  }

  public createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { stationId, vehicleId, timeWindowId, serviceType } = req.body
      const userObj = (req as AuthenticatedRequest).user
      const userId = userObj?.userId || userObj?.id || req.body.userId

      // Trigger cleanup of any expired held reservations before checking/reserving
      this.cleanupExpiredReservationsUseCase.execute().catch((err) => {
        console.error("Error during background reservation cleanup:", err)
      })

      // If request contains booking intent parameters, run Atomic Reservation Flow
      if (stationId && timeWindowId && serviceType) {
        if (!userId) {
          res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: "User authentication required" })
          return
        }

        const result = await this.createBookingReservationUseCase.execute(userId, {
          stationId,
          vehicleId,
          timeWindowId,
          serviceType,
          extraServiceIds: req.body.extraServiceIds,
          paymentType: req.body.paymentType || "ONLINE_FULL",
        })

        res.status(HTTP_STATUS.OK).json({
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
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: "Invalid amount. Minimum amount is 100 paise.",
        })
        return
      }

      const options = {
        amount: numericAmount,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
      }

      const order = await this.razorpay.orders.create(options)

      res.status(HTTP_STATUS.OK).json({
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
          res.status(HTTP_STATUS.CONFLICT).json({
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
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err?.message || "Failed to create Razorpay order",
      })
    }
  }

  public verifyPayment = async (req: Request, res: Response): Promise<void> => {
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
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Missing required verification fields (order_id, payment_id, or signature)",
        })
        return
      }

      const bookingDto = await this.confirmBookingReservationUseCase.execute({
        razorpay_order_id: targetOrderId,
        razorpay_payment_id: targetPaymentId,
        razorpay_signature: targetSignature,
      })

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Payment verified and booking confirmed successfully",
        booking: bookingDto,
        order_id: targetOrderId,
        payment_id: targetPaymentId,
      })
    } catch (error: unknown) {
      if (error instanceof AppError) {
        if (error.message === "RESERVATION_EXPIRED_REFUND_INITIATED") {
          res.status(HTTP_STATUS.BAD_REQUEST).json({
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
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err?.message || "Failed to verify payment signature",
      })
    }
  }

  public cancelReservation = async (req: Request, res: Response): Promise<void> => {
    try {
      const reservationId = req.params.id || req.body.reservationId
      const userObj = (req as AuthenticatedRequest).user
      const userId = userObj?.userId || userObj?.id || req.body.userId

      if (reservationId && userId) {
        await this.cancelBookingReservationUseCase.execute(reservationId, userId)
      }

      res.status(HTTP_STATUS.OK).json({ success: true, message: "Reservation cancelled successfully" })
    } catch (error: unknown) {
      console.error("Cancel reservation error:", error)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: "Failed to cancel reservation" })
    }
  }

  public handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const signature = req.headers["x-razorpay-signature"] as string
      const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body)

      const result = await this.processRazorpayWebhookUseCase.execute(rawBody, signature)
      res.status(HTTP_STATUS.OK).json(result)
    } catch (error: unknown) {
      console.error("Razorpay webhook processing error:", error)
      res.status(HTTP_STATUS.OK).json({ success: false, message: "Webhook error handled" })
    }
  }
}
