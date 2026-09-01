import { z } from "zod"
import { BookingStatus, PaymentMethod } from "../../domain/entities/Booking"

export const objectIdRegex = /^[0-9a-fA-F]{24}$/

export const createBookingSchema = z.object({
  stationId: z.string().regex(objectIdRegex, "Invalid station ID"),
  vehicleId: z.string().regex(objectIdRegex, "Invalid vehicle ID"),
  timeWindowId: z.string().regex(objectIdRegex, "Invalid time window ID"),
  serviceType: z.enum(["HALF", "FULL"]),
  extraServiceIds: z
    .array(z.string().regex(objectIdRegex, "Invalid extra service ID"))
    .optional()
    .default([]),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.ONLINE),
})

export const createWalkInBookingSchema = z.object({
  stationId: z.string().regex(objectIdRegex, "Invalid station ID"),
  timeWindowId: z.string().regex(objectIdRegex, "Invalid time window ID").optional(),
  serviceType: z.enum(["HALF", "FULL"]),
  paymentMethod: z.nativeEnum(PaymentMethod).optional().default(PaymentMethod.NO_PAYMENT),
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
  status: z.nativeEnum(BookingStatus).optional(),
  stationId: z.string().optional(),
  ownerId: z.string().optional(),
  q: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})
export const getOwnerBookingListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  status: z.nativeEnum(BookingStatus).optional(),
  stationId: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const bookingIdParamSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
})
