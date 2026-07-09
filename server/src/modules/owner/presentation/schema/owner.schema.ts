import z from "zod"

export const createOwnerSchema = z.object({
  legalFullName: z.string().min(1, "Legal full name is required").trim(),
  businessName: z.string().min(1, "Business name is required").trim(),
  businessType: z.enum(["INDIVIDUAL", "SOLE_PROP", "PARTNERSHIP", "PVT_LTD"]),
  gstNumber: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  businessEmail: z.string().email("Invalid email address").trim().optional().or(z.literal("")),
  hasStation: z.boolean(),
  hasMobileService: z.boolean(),
  mobileActive: z.boolean().optional(),
})

export const updateOwnerSchema = z.object({
  legalFullName: z.string().trim().optional(),
  businessName: z.string().trim().optional(),
  businessType: z.enum(["INDIVIDUAL", "SOLE_PROP", "PARTNERSHIP", "PVT_LTD"]).optional(),
  gstNumber: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  businessEmail: z.string().email("Invalid email address").trim().optional().or(z.literal("")),
  hasStation: z.boolean().optional(),
  hasMobileService: z.boolean().optional(),
  mobileActive: z.boolean().optional(),
})
