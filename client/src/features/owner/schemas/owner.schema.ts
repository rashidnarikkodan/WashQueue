import { z } from "zod"

export const step1Schema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "WhatsApp number must be exactly 10 digits")
    .optional()
    .or(z.literal("")),
  businessName: z.string().trim().min(2, "Business name must be at least 2 characters"),
  gstNumber: z.string().trim().optional().or(z.literal("")),
  idProofType: z.enum(["aadhar", "pan", "passport", "dl"], {
    message: "Please select an ID proof type",
  }),
  street1: z.string().trim().min(2, "Address line 1 must be at least 2 characters"),
  street2: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().min(2, "City must be at least 2 characters"),
  state: z.string().trim().min(2, "State must be at least 2 characters"),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Postal code must be exactly 6 digits"),
})

export const step2Schema = z.object({
  accountHolderName: z.string().trim().min(2, "Account holder name must be at least 2 characters"),
  bankName: z.string().trim().min(1, "Please select a bank"),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{8,18}$/, "Account number must be 8–18 digits"),
  ifscCode: z
    .string()
    .trim()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format (e.g. HDFC0001234)"),
})

export type Step1Input = z.infer<typeof step1Schema>
export type Step2Input = z.infer<typeof step2Schema>
