import { z } from "zod"
import { PaymentType } from "../../domain/entities/Booking"

export const objectIdRegex = /^[0-9a-fA-F]{24}$/

// --- Booking Schemas ---

export const createBookingSchema = z.object({
  stationId: z.string().regex(objectIdRegex, "Invalid station ID"),
  vehicleId: z.string().regex(objectIdRegex, "Invalid vehicle ID"),
  timeWindowId: z.string().regex(objectIdRegex, "Invalid time window ID"),
  serviceType: z.enum(["HALF", "FULL"]),
  extraServiceIds: z
    .array(z.string().regex(objectIdRegex, "Invalid extra service ID"))
    .optional()
    .default([]),
  paymentType: z.enum(["ONLINE_FULL", "DEPOSIT_PLUS_CASH", "CASH_WALKIN"]).default("ONLINE_FULL"),
})

export const createWalkInBookingSchema = z.object({
  stationId: z.string().regex(objectIdRegex, "Invalid station ID"),
  timeWindowId: z.string().regex(objectIdRegex, "Invalid time window ID").optional(),
  serviceType: z.enum(["HALF", "FULL"]),
  paymentType: z
    .enum(["ONLINE_FULL", "DEPOSIT_PLUS_CASH", "CASH_WALKIN"])
    .optional()
    .default("CASH_WALKIN"),
  extraServiceIds: z
    .array(z.string().regex(objectIdRegex, "Invalid extra service ID"))
    .optional()
    .default([]),
  customer: z
    .object({
      userId: z.string().regex(objectIdRegex, "Invalid user ID").optional(),
      name: z.string().min(1, "Customer name is required"),
      phone: z.string().min(5, "Customer phone is required"),
    })
    .optional(),
  vehicle: z.object({
    vehicleId: z.string().regex(objectIdRegex, "Invalid vehicle ID").optional(),
    registrationNumber: z.string().min(1, "Registration number is required"),
    categoryId: z.string().regex(objectIdRegex, "Invalid category ID"),
    classId: z.string().regex(objectIdRegex, "Invalid class ID"),
  }),
})

export const validateQrSchema = z
  .object({
    bookingId: z.string().optional(),
    qrToken: z.string().optional(),
  })
  .refine((data) => Boolean(data.bookingId?.trim() || data.qrToken?.trim()), {
    message: "Either bookingId or qrToken is required",
  })

export const cancelBookingSchema = z.object({
  reason: z.string().min(1, "Cancellation reason is required"),
})

export const rescheduleBookingSchema = z.object({
  newTimeWindowId: z.string().regex(objectIdRegex, "Invalid time window ID"),
})

export const getBookingListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  type: z.enum(["upcoming", "history", "all", "noshow"]).optional().default("all"),
  status: z.string().optional(),
  stationId: z.string().optional(),
  providerId: z.string().optional(),
  q: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const bookingIdParamSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
})

export const stationIdParamSchema = z.object({
  stationId: z.string().regex(objectIdRegex, "Invalid station ID"),
})

export const preInspectionSchema = z.object({
  photos: z.array(z.string()).optional().default([]),
  notes: z.string().optional(),
})

export const postInspectionSchema = z.object({
  photos: z.array(z.string()).optional().default([]),
  notes: z.string().optional(),
})

export const completeHandoverSchema = z.object({
  notes: z.string().optional(),
})

export const stallBookingSchema = z.object({
  reason: z.string().min(1, "Stall reason is required"),
})

export const resolveStalledSchema = z.object({
  resolution: z.string().min(1, "Resolution is required"),
  targetStatus: z.enum(["CHECKED_IN", "IN_SERVICE", "CANCELLED"]).optional(),
})

// --- Payment & Reservation Schemas ---

export const createPaymentOrderSchema = z.object({
  stationId: z.string().regex(objectIdRegex, "Invalid station ID"),
  vehicleId: z.string().regex(objectIdRegex, "Invalid vehicle ID"),
  timeWindowId: z.string().regex(objectIdRegex, "Invalid time window ID"),
  serviceType: z.enum(["HALF", "FULL"]),
  extraServiceIds: z
    .array(z.string().regex(objectIdRegex, "Invalid extra service ID"))
    .optional()
    .default([]),
  paymentType: z
    .enum([PaymentType.ONLINE_FULL, PaymentType.PAY_AT_STATION])
    .default(PaymentType.ONLINE_FULL),
  useWallet: z.boolean().optional().default(false),
})

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, "Razorpay order ID is required"),
  razorpay_payment_id: z.string().min(1, "Razorpay payment ID is required"),
  razorpay_signature: z.string().min(1, "Razorpay signature is required"),
  paymentMethod: z.enum(["RAZORPAY", "WALLET"]).optional().default("RAZORPAY"),
})

export const reservationIdParamSchema = z.object({
  id: z.string().min(1, "Reservation ID is required"),
})
