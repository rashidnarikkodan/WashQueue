import { z } from "zod"
import { StationStatus } from "../../domain/entities/Station"

const preprocessJson = (val: unknown) => {
  if (typeof val === "string") {
    if (val.trim() === "") return undefined
    try {
      return JSON.parse(val)
    } catch {
      return val
    }
  }
  return val
}

const imageSchema = z.object({
  url: z.string().url("Invalid image URL"),
  publicId: z.string().min(1, "Public ID is required"),
  isPrimary: z.boolean().default(false),
})

const contactSchema = z.object({
  phone: z
    .string({ message: "Contact phone is required" })
    .trim()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  email: z.string({ message: "Contact email is required" }).trim().email("Invalid email format"),
})

const locationSchema = z.object({
  latitude: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().min(-90).max(90)
  ),
  longitude: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().min(-180).max(180)
  ),
})

const addressSchema = z.object({
  street: z.string({ message: "Street is required" }).trim().min(1, "Street cannot be empty"),
  city: z.string({ message: "City is required" }).trim().min(1, "City cannot be empty"),
  state: z.string({ message: "State is required" }).trim().min(1, "State cannot be empty"),
  country: z.string({ message: "Country is required" }).trim().min(1, "Country cannot be empty"),
  pincode: z.string({ message: "Pincode is required" }).trim().min(1, "Pincode cannot be empty"),
})

export const createStationSchema = z.object({
  name: z
    .string({ message: "Station name is required" })
    .trim()
    .min(2, "Station name must be at least 2 characters"),
  description: z.string().trim().optional().or(z.literal("")),
  contact: z.preprocess(preprocessJson, contactSchema),
  location: z.preprocess(preprocessJson, locationSchema),
  address: z.preprocess(preprocessJson, addressSchema),
  images: z.preprocess(preprocessJson, z.array(imageSchema).optional().default([])),
})

const step1Schema = z.object({
  step: z.literal(1),
  name: z
    .string({ message: "Station name is required" })
    .trim()
    .min(2, "Station name must be at least 2 characters")
    .optional(),
  description: z.string().trim().optional().or(z.literal("")),
  contact: z.preprocess(preprocessJson, contactSchema.optional()),
  location: z.preprocess(preprocessJson, locationSchema.optional()),
  address: z.preprocess(preprocessJson, addressSchema.optional()),
  images: z.preprocess(preprocessJson, z.array(imageSchema).optional()),
  deletedImagePublicIds: z.preprocess(preprocessJson, z.array(z.string()).optional()),
  status: z.nativeEnum(StationStatus).optional(),
})

const operatingHourSchema = z.object({
  day: z.string().min(1, "Day is required"),
  open: z.string().regex(/^\d{2}:\d{2}$/, "Open time must be in HH:mm format"),
  close: z.string().regex(/^\d{2}:\d{2}$/, "Close time must be in HH:mm format"),
  isClosed: z.preprocess(
    (val) => (typeof val === "string" ? val === "true" || val === "1" : val),
    z.boolean().default(false)
  ),
})

const holidaySchema = z.object({
  date: z.preprocess((val) => (typeof val === "string" ? new Date(val) : val), z.date()),
  reason: z.string().trim().optional(),
})

const slotConfigurationSchema = z.object({
  bays: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number().int().min(1, "Bays must be at least 1")
  ),
  windowDurationMins: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number().int().min(1, "Window duration must be a positive number")
  ),
  capacityPerWindow: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number().int().min(1, "Capacity per window must be at least 1")
  ),
  walkInReservedSlots: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number().int().min(0).default(0)
  ),
  maxAdvanceBookingDays: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number().int().min(1, "Max advance booking days must be at least 1")
  ),
  allowWalkIns: z.preprocess(
    (val) => (typeof val === "string" ? val === "true" || val === "1" : val),
    z.boolean().default(false)
  ),
})

const step2Schema = z.object({
  step: z.literal(2),
  operatingHours: z.preprocess(
    preprocessJson,
    z.array(operatingHourSchema).min(1, "At least one operating hour slot is required")
  ),
  holidays: z.preprocess(preprocessJson, z.array(holidaySchema).optional().default([])),
  slotConfig: z.preprocess(preprocessJson, slotConfigurationSchema),
})

const pricingEntrySchema = z.object({
  vehicleClassId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid vehicleClassId"),
  halfWashPrice: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().min(0, "Price must be positive")
  ),
  fullWashPrice: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().min(0, "Price must be positive")
  ),
  isActive: z.preprocess(
    (val) => (typeof val === "string" ? val === "true" || val === "1" : val),
    z.boolean().optional().default(true)
  ),
})

const step3Schema = z.object({
  step: z.literal(3),
  pricing: z.preprocess(
    preprocessJson,
    z.array(pricingEntrySchema).min(1, "At least one pricing entry is required")
  ),
})

const extraServicePricingSchema = z.object({
  vehicleClassId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid vehicleClassId"),
  price: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().min(0, "Price must be positive")
  ),
})

const extraServiceInputSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid service ID")
    .optional()
    .or(z.literal("")),
  name: z.string().trim().min(2, "Service name must be at least 2 characters"),
  slug: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  pricing: z.array(extraServicePricingSchema).min(1, "At least one pricing entry is required"),
  isActive: z.preprocess(
    (val) => (typeof val === "string" ? val === "true" || val === "1" : val),
    z.boolean().default(true)
  ),
  isDeleted: z.preprocess(
    (val) => (typeof val === "string" ? val === "true" || val === "1" : val),
    z.boolean().optional().default(false)
  ),
})

const step4Schema = z.object({
  step: z.literal(4),
  amenities: z.preprocess(preprocessJson, z.array(z.string()).optional().default([])),
  extraServices: z.preprocess(
    preprocessJson,
    z.array(extraServiceInputSchema).optional().default([])
  ),
})

const patchBodyPreprocess = (val: unknown) => {
  if (typeof val === "object" && val !== null) {
    const body = { ...val } as Record<string, unknown>
    if ("step" in body && body.step !== undefined && body.step !== null) {
      if (typeof body.step === "string") {
        body.step = parseInt(body.step, 10)
      }
    } else {
      body.step = 1
    }
    return body
  }
  return val
}

export const patchStationSchema = z.preprocess(
  patchBodyPreprocess,
  z.discriminatedUnion("step", [step1Schema, step2Schema, step3Schema, step4Schema])
)

export const configureSlotConfigSchema = z.object({
  windowDurationMins: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z
      .number()
      .int()
      .min(5, "Window duration must be at least 5 mins")
      .max(240, "Window duration cannot exceed 240 mins")
  ),
  capacityPerWindow: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number().int().min(1, "Capacity per window must be at least 1")
  ),
  walkInReservedSlots: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number().int().min(0, "Walk-in reserved slots cannot be negative")
  ),
  maxAdvanceBookingDays: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z
      .number()
      .int()
      .min(1, "Max advance booking days must be at least 1")
      .max(365, "Max advance booking days cannot exceed 365")
  ),
  allowWalkIns: z.preprocess(
    (val) => (typeof val === "string" ? val === "true" || val === "1" : val),
    z.boolean().optional().default(true)
  ),
})

export const getAvailableTimeWindowsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, must be YYYY-MM-DD"),
})

export const getStationsQuery = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  maxDistanceKm: z.coerce.number().optional(),
  minRating: z.coerce.number().optional(),
  vehicleCategory: z.string().optional(),
  vehicleClassId: z.string().optional(),
  status: z.enum([...Object.values(StationStatus),'all']).optional(),
  sortBy: z.string().optional(),
  search: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  ownerId: z.string().optional()
})
