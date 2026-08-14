import { Router } from "express"
import { PaymentController } from "./payment.controller"
import { API_ROUTES } from "@/common/constants/route.constants"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"

export const createPaymentRouter = (paymentController: PaymentController): Router => {
  const paymentRouter = Router()

  paymentRouter.post(API_ROUTES.PAYMENT.CREATE_ORDER, authenticate, paymentController.createOrder)
  paymentRouter.post(API_ROUTES.PAYMENT.VERIFY_PAYMENT, authenticate, paymentController.verifyPayment)
  paymentRouter.post(API_ROUTES.PAYMENT.CANCEL_RESERVATION, authenticate, paymentController.cancelReservation)
  paymentRouter.post(API_ROUTES.PAYMENT.WEBHOOK, paymentController.handleWebhook)

  // Direct fallback paths when router is attached at /api base level
  paymentRouter.post(API_ROUTES.PAYMENT.CREATE_ORDER, authenticate, paymentController.createOrder)
  paymentRouter.post(API_ROUTES.PAYMENT.VERIFY_PAYMENT, authenticate, paymentController.verifyPayment)

  return paymentRouter
}
