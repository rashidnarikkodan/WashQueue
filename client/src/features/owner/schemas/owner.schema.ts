import { z } from "zod";

export const ownerOnboardingSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  whatsapp: z.string().optional(),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessType: z.enum(["single", "enterprise", "detailer"]),
  gstNumber: z.string().optional(),
  idProofType: z.enum(["aadhar", "pan", "passport", "dl"]),
  
  // Bank Details
  accountHolderName: z.string().min(2, "Account holder name must be at least 2 characters"),
  bankName: z.string().min(1, "Please select a bank"),
  accountNumber: z.string().min(8, "Account number must be at least 8 digits"),
  ifscCode: z.string().min(11, "IFSC code must be 11 characters"),
});

export type OwnerOnboardingInput = z.infer<typeof ownerOnboardingSchema>;
