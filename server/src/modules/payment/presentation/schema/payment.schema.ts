import { z } from "zod"
import { PaymentMethod } from "@/modules/booking/domain/entities/Booking"
import { objectIdRegex } from "@/modules/booking/presentation/schema/booking.schema"

export const createPaymentOrderSchema = z.object({
  stationId: z.string().regex(objectIdRegex, "Invalid station ID"),
  vehicleId: z.string().regex(objectIdRegex, "Invalid vehicle ID"),
  timeWindowId: z.string().regex(objectIdRegex, "Invalid time window ID"),
  serviceType: z.enum(["HALF", "FULL"]),
  extraServiceIds: z
    .array(z.string().regex(objectIdRegex, "Invalid extra service ID"))
    .optional()
    .default([]),
  paymentMethod: z
    .enum([PaymentMethod.ONLINE, PaymentMethod.PAY_AT_STATION])
    .default(PaymentMethod.ONLINE),
  useWallet: z.boolean().optional().default(false),
})

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, "Razorpay order ID is required"),
  razorpay_payment_id: z.string().min(1, "Razorpay payment ID is required"),
  razorpay_signature: z.string().min(1, "Razorpay signature is required"),
  paymentMethod: z.nativeEnum(PaymentMethod).optional().default(PaymentMethod.ONLINE),
})

export const reservationIdParamSchema = z.object({
  id: z.string().min(1, "Reservation ID is required"),
})
