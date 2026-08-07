import { z } from "zod"

export const createBookingSchema = z.object({
  stationId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid station ID"),
  vehicleId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid vehicle ID"),
  timeWindowId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid time window ID"),
  serviceType: z.enum(["HALF", "FULL"]),
  extraServiceIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/))
    .optional()
    .default([]),
  paymentType: z.enum(["ONLINE_FULL", "DEPOSIT_PLUS_CASH", "CASH_WALKIN"]).default("ONLINE_FULL"),
})

export const createWalkInBookingSchema = z.object({
  stationId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid station ID"),
  timeWindowId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid time window ID"),
  serviceType: z.enum(["HALF", "FULL"]),
  paymentType: z
    .enum(["ONLINE_FULL", "DEPOSIT_PLUS_CASH", "CASH_WALKIN"])
    .optional()
    .default("CASH_WALKIN"),
  extraServiceIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/))
    .optional()
    .default([]),

  customer: z
    .object({
      userId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional(),
      name: z.string().min(1, "Customer name is required"),
      phone: z.string().min(5, "Customer phone is required"),
    })
    .optional(),

  vehicle: z.object({
    vehicleId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    registrationNumber: z.string().min(1, "Registration number is required"),
    categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID"),
    classId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid class ID"),
  }),
})

export const checkInBookingSchema = z.object({
  bookingId: z.string().optional(),
  qrToken: z.string().min(1, "QR token is required"),
})

export const advanceStatusSchema = z.object({
  targetStatus: z.enum(["IN_SERVICE", "SERVICE_COMPLETED", "AWAITING_HANDOVER", "COMPLETED"]),
  notes: z.string().optional(),
})

export const cancelBookingSchema = z.object({
  reason: z.string().min(1, "Cancellation reason is required"),
})
