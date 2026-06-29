import z from "zod"

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  code: z
    .string()
    .trim()
    .length(6, { message: "OTP code must be 6 digits" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
