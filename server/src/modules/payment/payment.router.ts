import { Router } from "express"
import { createOrder, verifyPayment } from "./payment.controller"
import { API_ROUTES } from "@/common/constants/route.constants"

const paymentRouter = Router()

paymentRouter.post(API_ROUTES.PAYMENT.CREATE_ORDER, createOrder)
paymentRouter.post(API_ROUTES.PAYMENT.VERIFY_PAYMENT, verifyPayment)

// Support direct fallback paths for POST /api/create-order and POST /api/verify-payment
paymentRouter.post("/create-order", createOrder)
paymentRouter.post("/verify-payment", verifyPayment)

export default paymentRouter
