import z from "zod"
import { ForgotPasswordInput } from "../../application/dto/forgot-password.dto"

export const forgotPasswordSchema: z.ZodType<ForgotPasswordInput> = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
})
