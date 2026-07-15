import z from "zod"

export const updateUserSchema = z.object({
  isBlocked: z.boolean().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  isVerified: z.boolean().optional(),
  onboardingStep: z.number().optional(),
  rejectionReason: z.string().optional(),
})
