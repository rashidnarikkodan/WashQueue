import { z } from "zod"

/**
 * All multipart body fields arrive as strings (multer behaviour),
 * so step is z.literal("1") / z.literal("2") — not z.number().
 */

const step1Schema = z.object({
  step: z.literal("1"),
  fullName: z
    .string({ message: "Full name is required" })
    .trim()
    .min(2, "Full name must be at least 2 characters"),
  phone: z
    .string({ message: "Phone number is required" })
    .trim()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "WhatsApp number must be exactly 10 digits")
    .optional()
    .or(z.literal("")),
  businessName: z
    .string({ message: "Business name is required" })
    .trim()
    .min(2, "Business name must be at least 2 characters"),
  gstNumber: z.string().trim().optional().or(z.literal("")),
  idProofType: z.enum(["aadhar", "pan", "passport", "dl"], {
    message: "ID proof type is required",
  }),
})

const step2Schema = z.object({
  step: z.literal("2"),
  accountHolderName: z
    .string({ message: "Account holder name is required" })
    .trim()
    .min(2, "Account holder name must be at least 2 characters"),
  bankName: z
    .string({ message: "Please select a bank" })
    .trim()
    .min(1, "Please select a bank"),
  accountNumber: z
    .string({ message: "Account number is required" })
    .trim()
    .regex(/^\d{8,18}$/, "Account number must be 8–18 digits"),
  ifscCode: z
    .string({ message: "IFSC code is required" })
    .trim()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format (e.g. HDFC0001234)"),
  accountType: z.enum(["Savings Account", "Current Account"], {
    message: "Account type is required",
  }),
})

/** Discriminated union — automatically picks the right schema based on the `step` field */
export const saveOnboardingStepSchema = z.discriminatedUnion("step", [step1Schema, step2Schema])

export type Step1Input = z.infer<typeof step1Schema>
export type Step2Input = z.infer<typeof step2Schema>
