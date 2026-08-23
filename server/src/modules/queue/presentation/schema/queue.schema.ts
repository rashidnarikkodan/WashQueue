import { z } from "zod"
import { objectIdRegex } from "@/modules/booking/presentation/schema/booking.schema"

export const stationIdParamSchema = z.object({
  stationId: z.string().regex(objectIdRegex, "Invalid station ID"),
})

export const validateQrSchema = z
  .object({
    bookingId: z.string().optional(),
    qrToken: z.string().optional(),
  })
  .refine((data) => Boolean(data.bookingId?.trim() || data.qrToken?.trim()), {
    message: "Either bookingId or qrToken is required",
  })

export const preInspectionSchema = z.object({
  photos: z.array(z.string()).optional().default([]),
  notes: z.string().optional(),
})

export const inspectionChecklistItemSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  passed: z.boolean(),
  remark: z.string().optional(),
})

export const postInspectionSchema = z.object({
  photos: z.array(z.string()).optional().default([]),
  notes: z.string().optional(),
  checklist: z.array(inspectionChecklistItemSchema).optional().default([]),
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
