import { z } from "zod"

export const stationDetailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Station name must be at least 3 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Phone number must be a valid 10-digit number"),
  email: z
    .string()
    .trim()
    .email("Invalid contact email address"),
  description: z.string().trim().optional(),
  street: z
    .string()
    .trim()
    .min(3, "Street address must be at least 3 characters"),
  city: z
    .string()
    .trim()
    .min(2, "Town / City is required"),
  pincode: z
    .string()
    .trim()
    .regex(/^[0-9]{5,6}$/, "PIN / Zip Code must be 5 or 6 digits"),
  district: z.string().trim().optional(),
  state: z
    .string()
    .trim()
    .min(2, "State is required"),
  country: z
    .string()
    .trim()
    .min(2, "Country is required"),
  latitude: z
    .number({ message: "Latitude is required" })
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .refine((val) => val !== 0, "Please select or enter valid station latitude"),
  longitude: z
    .number({ message: "Longitude is required" })
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .refine((val) => val !== 0, "Please select or enter valid station longitude"),
})

export const operatingBreakSchema = z.object({
  name: z.string().trim().optional(),
  start: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:mm format"),
  end: z.string().regex(/^\d{2}:\d{2}$/, "End time must be in HH:mm format"),
})

export const operatingHourSchema = z.object({
  day: z.string().min(1, "Day is required"),
  open: z.string().regex(/^\d{2}:\d{2}$/, "Open time must be in HH:mm format"),
  close: z.string().regex(/^\d{2}:\d{2}$/, "Close time must be in HH:mm format"),
  isClosed: z.boolean(),
  breaks: z.array(operatingBreakSchema).optional(),
})

export const availabilitySchema = z.object({
  operatingHours: z.array(operatingHourSchema).min(1, "At least one operating hour entry is required"),
  bays: z.coerce.number().int().min(1, "Number of bays must be at least 1"),
  windowDurationMins: z.coerce.number().int().min(5, "Window duration must be at least 5 mins").max(240, "Window duration cannot exceed 240 mins"),
  capacityPerWindow: z.coerce.number().int().min(1, "Capacity per window must be at least 1"),
  walkInReservedSlots: z.coerce.number().int().min(0, "Walk-in slots cannot be negative"),
  maxAdvanceBookingDays: z.coerce.number().int().min(1, "Max advance booking days must be at least 1").max(365, "Max advance booking days cannot exceed 365"),
  bufferBetweenWindowsMins: z.coerce.number().int().min(0).default(0),
  allowWalkIns: z.boolean().default(true),
})

export const pricingEntrySchema = z.object({
  vehicleClassId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid vehicleClassId"),
  halfWashPrice: z.coerce.number().positive("Price must be greater than 0"),
  fullWashPrice: z.coerce.number().positive("Price must be greater than 0"),
  isActive: z.boolean().default(true),
})

export const pricingConfigurationSchema = z.object({
  pricing: z.array(pricingEntrySchema).min(1, "At least one pricing entry is required"),
})

export const extraServicePricingSchema = z.object({
  vehicleClassId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid vehicleClassId"),
  price: z.coerce.number().positive("Price must be greater than 0"),
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
