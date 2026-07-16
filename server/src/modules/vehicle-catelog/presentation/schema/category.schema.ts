import { z } from "zod"

export const createCategorySchema = z.object({
  name: z
    .string({ message: "Category name is required" })
    .trim()
    .min(1, "Category name cannot be empty")
    .max(100, "Category name is too long"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be url-friendly (alphanumeric and dashes)")
    .optional(),
  order: z.number().int().min(0).optional(),
})

export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name cannot be empty")
    .max(100, "Category name is too long")
    .optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be url-friendly (alphanumeric and dashes)")
    .optional(),
  order: z.number().int().min(0).optional(),
})
