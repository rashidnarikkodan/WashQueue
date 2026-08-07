import { Router } from "express"
import { createOrder, verifyPayment, cancelReservation, handleWebhook } from "./payment.controller"
import { API_ROUTES } from "@/common/constants/route.constants"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"

const paymentRouter = Router()

paymentRouter.post(API_ROUTES.PAYMENT.CREATE_ORDER, authenticate, createOrder)
paymentRouter.post(API_ROUTES.PAYMENT.VERIFY_PAYMENT, authenticate, verifyPayment)
paymentRouter.post("/reservations/:id/cancel", authenticate, cancelReservation)
paymentRouter.post("/webhook", handleWebhook)

// Support direct fallback paths for POST /api/create-order, POST /api/verify-payment, and POST /api/webhook
paymentRouter.post("/create-order", authenticate, createOrder)
paymentRouter.post("/verify-payment", authenticate, verifyPayment)

export default paymentRouter
