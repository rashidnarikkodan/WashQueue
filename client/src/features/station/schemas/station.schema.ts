import { z } from "zod"

export const stationDetailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Station name must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  email: z
    .string()
    .trim()
    .email("Invalid contact email address"),
  description: z.string().trim().optional(),
  street: z
    .string()
    .trim()
    .min(1, "Street / Building No is required"),
  city: z
    .string()
    .trim()
    .min(1, "Town / City is required"),
  pincode: z
    .string()
    .trim()
    .min(1, "PIN / Zip Code is required"),
  district: z.string().trim().optional(),
  state: z
    .string()
    .trim()
    .min(1, "State is required"),
  country: z
    .string()
    .trim()
    .min(1, "Country is required"),
  latitude: z.number({ message: "Latitude is required" }).min(-90).max(90),
  longitude: z.number({ message: "Longitude is required" }).min(-180).max(180),
})

export const operatingHourSchema = z.object({
  day: z.string().min(1, "Day is required"),
  open: z.string().regex(/^\d{2}:\d{2}$/, "Open time must be in HH:mm format"),
  close: z.string().regex(/^\d{2}:\d{2}$/, "Close time must be in HH:mm format"),
  isClosed: z.boolean(),
})

export const availabilitySchema = z.object({
  operatingHours: z.array(operatingHourSchema).min(1, "At least one operating hour entry is required"),
  bays: z.coerce.number().int().min(1, "Number of bays must be at least 1"),
  windowDurationMins: z.coerce.number().int().min(1, "Window duration must be at least 1 min"),
  capacityPerWindow: z.coerce.number().int().min(1, "Capacity per window must be at least 1"),
  walkInReservedSlots: z.coerce.number().int().min(0, "Walk-in slots cannot be negative"),
  maxAdvanceBookingDays: z.coerce.number().int().min(1, "Max advance booking days must be at least 1"),
  bufferBetweenWindowsMins: z.coerce.number().int().min(0).default(0),
  allowWalkIns: z.boolean().default(true),
})

export const pricingEntrySchema = z.object({
  vehicleClassId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid vehicleClassId"),
  halfWashPrice: z.coerce.number().min(0, "Price cannot be negative"),
  fullWashPrice: z.coerce.number().min(0, "Price cannot be negative"),
  isActive: z.boolean().default(true),
})

export const pricingConfigurationSchema = z.object({
  pricing: z.array(pricingEntrySchema).min(1, "At least one pricing entry is required"),
})

export const extraServicePricingSchema = z.object({
  vehicleClassId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid vehicleClassId"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
})

export const extraServiceItemSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid service ID").optional(),
  name: z.string().trim().min(2, "Service name must be at least 2 characters"),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional(),
  pricing: z.array(extraServicePricingSchema).min(1, "At least one pricing entry is required"),
  isActive: z.boolean().default(true),
  isDeleted: z.boolean().optional(),
})

export const extraServicesSchema = z.object({
  amenities: z.array(z.string()),
  extraServices: z.array(extraServiceItemSchema),
})

export type StationDetailsFormData = z.infer<typeof stationDetailsSchema>
export type AvailabilityFormData = z.infer<typeof availabilitySchema>
export type PricingConfigurationFormData = z.infer<typeof pricingConfigurationSchema>
export type ExtraServicesFormData = z.infer<typeof extraServicesSchema>
