import { z } from "zod"
import { StationStatus } from "../../domain/entities/Station"

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
  email: z
    .string({ message: "Contact email is required" })
    .trim()
    .email("Invalid email format"),
})

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
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
  contact: contactSchema,
  location: locationSchema,
  address: addressSchema,
  images: z.array(imageSchema).min(1, "At least one image is required"),
})

// Step 1 — basic info update (after initial creation)
const step1Schema = z.object({
  step: z.literal(1),
  name: z
    .string({ message: "Station name is required" })
    .trim()
    .min(2, "Station name must be at least 2 characters")
    .optional(),
  description: z.string().trim().optional().or(z.literal("")),
  contact: contactSchema.optional(),
  location: locationSchema.optional(),
  address: addressSchema.optional(),
  images: z.array(imageSchema).optional(),
  status: z.nativeEnum(StationStatus).optional(),
})

// Step 2 — availability
const operatingHourSchema = z.object({
  day: z.string().min(1, "Day is required"),
  open: z.string().regex(/^\d{2}:\d{2}$/, "Open time must be in HH:mm format"),
  close: z.string().regex(/^\d{2}:\d{2}$/, "Close time must be in HH:mm format"),
  isClosed: z.boolean().default(false),
})

const holidaySchema = z.object({
  date: z.preprocess((val) => (typeof val === "string" ? new Date(val) : val), z.date()),
  reason: z.string().trim().optional(),
})

const slotConfigurationSchema = z.object({
  bays: z.number().int().min(1, "Bays must be at least 1"),
  windowDurationMins: z.number().int().min(1, "Window duration must be a positive number"),
  capacityPerWindow: z.number().int().min(1, "Capacity per window must be at least 1"),
  walkInReservedSlots: z.number().int().min(0).default(0),
  maxAdvanceBookingDays: z.number().int().min(1, "Max advance booking days must be at least 1"),
  bufferBetweenWindowsMins: z.number().int().min(0).default(0),
  allowWalkIns: z.boolean().default(false),
})

const step2Schema = z.object({
  step: z.literal(2),
  operatingHours: z.array(operatingHourSchema).min(1, "At least one operating hour slot is required"),
  holidays: z.array(holidaySchema).optional().default([]),
  slotConfig: slotConfigurationSchema,
})

// Step 3 — pricing
const pricingEntrySchema = z.object({
  vehicleClassId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid vehicleClassId"),
  halfWashPrice: z.number().min(0, "Price must be positive"),
  fullWashPrice: z.number().min(0, "Price must be positive"),
  isActive: z.boolean().optional().default(true),
})

const step3Schema = z.object({
  step: z.literal(3),
  pricing: z.array(pricingEntrySchema).min(1, "At least one pricing entry is required"),
})

// Step 4 — amenities & extra services
const extraServicePricingSchema = z.object({
  vehicleClassId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid vehicleClassId"),
  price: z.number().min(0, "Price must be positive"),
})

const extraServiceInputSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid service ID").optional(),
  name: z.string().trim().min(2, "Service name must be at least 2 characters"),
  description: z.string().trim().optional(),
  pricing: z.array(extraServicePricingSchema).min(1, "At least one pricing entry is required"),
  isActive: z.boolean().default(true),
  isDeleted: z.boolean().optional().default(false),
})

const step4Schema = z.object({
  step: z.literal(4),
  amenities: z.array(z.string()).optional().default([]),
  extraServices: z.array(extraServiceInputSchema).optional().default([]),
})

export const patchStationSchema = z.discriminatedUnion("step", [
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
])
