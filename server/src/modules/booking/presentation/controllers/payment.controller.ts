import { Request, Response } from "express"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import { BadRequestError } from "@/common/errors/bad-request-error"
import success from "@/common/utils/success"
import {
  ICreateBookingReservationUseCase,
  IConfirmBookingReservationUseCase,
  ICancelBookingReservationUseCase,
  IProcessRazorpayWebhookUseCase,
} from "../../application/interfaces/booking-usecases.interface"

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

    const result = await this.createBookingReservationUseCase.execute(userId, req.body)

    success(
      res,
      {
        order_id: result.paymentOrderId,
        id: result.paymentOrderId,
        amount: result.amount,
        currency: result.currency,
        reservation_id: result.reservationId,
        wallet_amount: result.walletAmount,
        expires_at: result.expiresAt,
      },
      HTTP_STATUS.OK,
      "Payment order created successfully"
    )
  }

  verifyPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentMethod } = req.body

    const bookingDto = await this.confirmBookingReservationUseCase.execute({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentMethod,
    })

    success(
      res,
      {
        booking: bookingDto,
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
      },
      HTTP_STATUS.OK,
      "Payment verified and booking confirmed successfully"
    )
  }

  cancelReservation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { id: reservationId } = req.params as { id: string }

    await this.cancelBookingReservationUseCase.execute(reservationId, userId)

    success(res, null, HTTP_STATUS.OK, "Reservation cancelled successfully")
  }

  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers["x-razorpay-signature"] as string
    if (!signature) {
      throw new BadRequestError("Missing x-razorpay-signature header")
    }

    const capturedRawBody = (req as Request & { rawBody?: Buffer }).rawBody
    const rawBody =
      typeof req.body === "string"
        ? req.body
        : capturedRawBody
          ? capturedRawBody.toString("utf-8")
          : JSON.stringify(req.body)
    const result = await this.processRazorpayWebhookUseCase.execute(rawBody, signature)

    if (!result.success) {
      throw new BadRequestError(result.message || "Webhook processing failed")
    }

    success(res, result, HTTP_STATUS.OK, "Webhook processed successfully")
  }
}
