import z from "zod"

export const createOwnerSchema = z.object({
  legalFullName: z.string().min(1, "Legal full name is required").trim(),
  phone:z.string().trim().min(10,"Valid phone number is required"),
  businessName: z.string().min(1, "Business name is required").trim(),
  gstNumber: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  businessEmail: z.string().email("Invalid email address").trim().optional().or(z.literal("")),
})

export const updateOwnerSchema = z.object({
  legalFullName: z.string().trim().optional(),
  businessName: z.string().trim().optional(),
  gstNumber: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  businessEmail: z.string().email("Invalid email address").trim().optional().or(z.literal("")),
})
