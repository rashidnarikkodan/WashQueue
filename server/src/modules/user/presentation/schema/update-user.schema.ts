import z from "zod"
import { UpdateUserInput } from "../../application/dto/update-user.dto"

export const updateUserBodySchema: z.ZodType<UpdateUserInput> = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().optional(),
  isBlocked: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  onboardingStep: z.number().min(1).max(4).optional(),
})
