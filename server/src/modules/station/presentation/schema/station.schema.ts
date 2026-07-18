import { z } from "zod"

export const createStationSchema = z.object({
  name: z.string({ message: "Station name is required" }).trim().min(2, "Station name must be at least 2 characters"),
  description: z.string().trim().optional().or(z.literal("")),
  contactPhone: z.string({ message: "Contact phone is required" }).trim().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  contactEmail: z.string({ message: "Contact email is required" }).trim().email("Invalid email format"),
})

export const patchStationSchema = z.object({
  name: z.string().trim().min(2, "Station name must be at least 2 characters").optional(),
  description: z.string().trim().optional(),
  contactPhone: z.string().trim().regex(/^\d{10}$/, "Phone number must be exactly 10 digits").optional(),
  contactEmail: z.string().trim().email("Invalid email format").optional(),
  location: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([
      z.number().min(-180).max(180), // longitude
      z.number().min(-90).max(90)   // latitude
    ])
  }).optional(),
  address: z.string().trim().min(1, "Address cannot be empty").optional(),
  pincode: z.string().trim().min(1, "Pincode cannot be empty").optional(),
  city: z.string().trim().min(1, "City cannot be empty").optional(),
  state: z.string().trim().min(1, "State cannot be empty").optional(),
  images: z.array(z.object({
    url: z.string().url("Invalid image URL"),
    publicId: z.string().min(1, "Public ID is required"),
    isPrimary: z.boolean().default(false)
  })).optional(),
  bays: z.number().int().min(1, "Bays must be at least 1").optional(),
  avgServiceTime: z.number().int().min(1, "Average service time must be at least 1").optional(),
  operatingHours: z.array(z.object({
    day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
    open: z.string().regex(/^\d{2}:\d{2}$/, "Open time must be in HH:mm format"),
    close: z.string().regex(/^\d{2}:\d{2}$/, "Close time must be in HH:mm format"),
    isClosed: z.boolean().default(false)
  })).optional(),
  holidays: z.array(z.object({
    date: z.preprocess((val) => (typeof val === "string" ? new Date(val) : val), z.date()),
    reason: z.string().min(1, "Holiday reason is required")
  })).optional(),
  amenities: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
})

export const submitStationSchema = z.object({
  name: z.string().trim().min(2, "Station name must be at least 2 characters"),
  description: z.string().trim().min(1, "Description is required"),
  contactPhone: z.string().trim().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  contactEmail: z.string().trim().email("Invalid email format"),
  location: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([
      z.number().min(-180).max(180), // longitude
      z.number().min(-90).max(90)   // latitude
    ])
  }, { message: "Location coordinates are required" }),
  address: z.string().trim().min(1, "Address is required"),
  pincode: z.string().trim().min(1, "Pincode is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  images: z.array(z.object({
    url: z.string().url("Invalid image URL"),
    publicId: z.string().min(1, "Public ID is required"),
    isPrimary: z.boolean().default(false)
  })).min(1, "At least one station image is required"),
  bays: z.number().int().min(1, "Bays must be at least 1"),
  avgServiceTime: z.number().int().min(1, "Average service time must be at least 1"),
  operatingHours: z.array(z.object({
    day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
    open: z.string().regex(/^\d{2}:\d{2}$/, "Open time must be in HH:mm format"),
    close: z.string().regex(/^\d{2}:\d{2}$/, "Close time must be in HH:mm format"),
    isClosed: z.boolean().default(false)
  })).min(1, "Operating hours are required"),
  holidays: z.array(z.object({
    date: z.preprocess((val) => (typeof val === "string" ? new Date(val) : val), z.date()),
    reason: z.string().min(1, "Holiday reason is required")
  })).optional().default([]),
  amenities: z.array(z.string()).optional().default([])
})
