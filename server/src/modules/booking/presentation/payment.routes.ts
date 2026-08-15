import { Router } from "express"
import { PaymentController } from "./payment.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import {
  createPaymentOrderSchema,
  verifyPaymentSchema,
  reservationIdParamSchema,
} from "./schema/booking.schema"

export const createPaymentRouter = (paymentController: PaymentController): Router => {
  const router = Router()

  // Webhook endpoint (unauthenticated)
  router.post("/webhook", asyncHandler(paymentController.handleWebhook))

  // Authenticated endpoints
  router.use(authenticate)

  router.post(
    "/create-order",
    validateRequest(createPaymentOrderSchema),
    asyncHandler(paymentController.createOrder)
  )

  router.post(
    "/verify-payment",
    validateRequest(verifyPaymentSchema),
    asyncHandler(paymentController.verifyPayment)
  )

  router.post(
    "/reservations/:id/cancel",
    validateRequest(reservationIdParamSchema, "params"),
    asyncHandler(paymentController.cancelReservation)
  )

  return router
}
