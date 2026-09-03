import { z } from "zod"

const step1Schema = z.object({
  step: z.literal("1"),
  fullName: z
    .string({ message: "Full name is required" })
    .trim()
    .min(2, "Full name must be at least 2 characters"),
  phone: z
    .string({ message: "Phone number is required" })
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
  whatsapp: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit WhatsApp number")
    .optional()
    .or(z.literal("")),
  businessName: z
    .string({ message: "Business name is required" })
    .trim()
    .min(2, "Business name must be at least 2 characters"),
  gstNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Enter a valid GSTIN")
    .optional()
    .or(z.literal("")),
  idProofType: z.enum(["aadhar", "pan", "passport", "dl"], {
    message: "ID proof type is required",
  }),
  street1: z
    .string({ message: "Address line 1 is required" })
    .trim()
    .min(2, "Address line 1 must be at least 2 characters"),
  street2: z.string().trim().optional().or(z.literal("")),
  city: z
    .string({ message: "City is required" })
    .trim()
    .min(2, "City must be at least 2 characters"),
  state: z
    .string({ message: "State is required" })
    .trim()
    .min(2, "State must be at least 2 characters"),
  postalCode: z
    .string({ message: "Postal code is required" })
    .trim()
    .regex(/^\d{6}$/, "Postal code must be exactly 6 digits"),
  country: z.string().trim().optional().default("IN"),
})

const step2Schema = z.object({
  step: z.literal("2"),
  accountHolderName: z
    .string({ message: "Account holder name is required" })
    .trim()
    .min(2, "Account holder name must be at least 2 characters"),
  bankName: z.string({ message: "Please select a bank" }).trim().min(1, "Please select a bank"),
  accountNumber: z
    .string({ message: "Account number is required" })
    .trim()
    .regex(/^\d{8,18}$/, "Account number must be 8–18 digits"),
  ifscCode: z
    .string({ message: "IFSC code is required" })
    .trim()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format (e.g. HDFC0001234)"),
})

export const saveOnboardingStepSchema = z.discriminatedUnion("step", [step1Schema, step2Schema])

export type Step1Input = z.infer<typeof step1Schema>
export type Step2Input = z.infer<typeof step2Schema>
