import { z } from "zod"

export const createVehicleSchema = z.object({
  nickname: z.string().min(2, "Nickname must be at least 2 characters").max(50),
  brand: z.string().min(1, "Brand is required").max(50),
  model: z.string().min(1, "Model is required").max(50),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  registrationNumber: z.string().nullable().optional(),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Category ID"),
  classId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Class ID"),
  isPrimary: z.boolean().optional(),
})

export const updateVehicleSchema = z.object({
  nickname: z.string().min(2, "Nickname must be at least 2 characters").max(50).optional(),
  brand: z.string().min(1, "Brand is required").max(50).optional(),
  model: z.string().min(1, "Model is required").max(50).optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  registrationNumber: z.string().nullable().optional(),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Category ID").optional(),
  classId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Class ID").optional(),
})
