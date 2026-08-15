import { Request, Response } from "express"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import { AppError } from "@/common/errors/app-error"
import {
  ICreateBookingReservationUseCase,
  IConfirmBookingReservationUseCase,
  ICancelBookingReservationUseCase,
  IProcessRazorpayWebhookUseCase,
} from "../application/interfaces/booking-usecases.interface"

export class PaymentController {
  constructor(
    private readonly createBookingReservationUseCase: ICreateBookingReservationUseCase,
    private readonly confirmBookingReservationUseCase: IConfirmBookingReservationUseCase,
    private readonly cancelBookingReservationUseCase: ICancelBookingReservationUseCase,
    private readonly processRazorpayWebhookUseCase: IProcessRazorpayWebhookUseCase
  ) {}

  createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    try {
      const result = await this.createBookingReservationUseCase.execute(userId, req.body)

      res.status(HTTP_STATUS.OK).json({
        success: true,
        order_id: result.razorpayOrderId,
        id: result.razorpayOrderId,
        amount: result.amount,
        currency: result.currency,
        reservation_id: result.reservationId,
        expires_at: result.expiresAt,
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
      throw error
    }
  }

  verifyPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    try {
      const bookingDto = await this.confirmBookingReservationUseCase.execute({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      })

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Payment verified and booking confirmed successfully",
        booking: bookingDto,
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
      })
    } catch (error: unknown) {
      if (error instanceof AppError) {
        if (error.message === "RESERVATION_EXPIRED_REFUND_INITIATED") {
          res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            code: "RESERVATION_EXPIRED_REFUND_INITIATED",
            message:
              error.details ||
              "Your payment succeeded, but the 10-minute hold expired. A refund has been automatically initiated for your payment.",
          })
          return
        }
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        })
        return
      }
      throw error
    }
  }

  cancelReservation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { id: reservationId } = req.params as { id: string }

    await this.cancelBookingReservationUseCase.execute(reservationId, userId)
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Reservation cancelled successfully",
    })
  }

  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers["x-razorpay-signature"] as string
    if (!signature) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Missing x-razorpay-signature header",
      })
      return
    }

    const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body)
    const result = await this.processRazorpayWebhookUseCase.execute(rawBody, signature)

    if (!result.success) {
      if (result.message.toLowerCase().includes("signature") || result.message.toLowerCase().includes("missing")) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(result)
        return
      }
    }

    res.status(HTTP_STATUS.OK).json(result)
  }
}
