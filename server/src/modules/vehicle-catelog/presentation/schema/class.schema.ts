import { z } from "zod"

const objectIdRegex = /^[0-9a-fA-F]{24}$/

export const createClassSchema = z.object({
  categoryId: z
    .string({ message: "Category ID is required" })
    .regex(objectIdRegex, "Invalid Category ID format"),
  name: z
    .string({ message: "Class name is required" })
    .trim()
    .min(1, "Class name cannot be empty")
    .max(100, "Class name is too long"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be url-friendly (alphanumeric and dashes)")
    .optional(),
  order: z.number().int().min(0).optional(),
})

export const updateClassSchema = z.object({
  categoryId: z.string().regex(objectIdRegex, "Invalid Category ID format").optional(),
  name: z
    .string()
    .trim()
    .min(1, "Class name cannot be empty")
    .max(100, "Class name is too long")
    .optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be url-friendly (alphanumeric and dashes)")
    .optional(),
  order: z.number().int().min(0).optional(),
})

export const getClassesQuerySchema = z.object({
  categoryId: z.string().regex(objectIdRegex, "Invalid Category ID format").optional(),
})
