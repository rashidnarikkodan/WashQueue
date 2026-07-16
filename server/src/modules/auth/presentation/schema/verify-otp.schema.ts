import z from "zod"
import { VerifyOtpInput } from "../../application/dto/verify-otp.dto"

export const verifyOtpSchema: z.ZodType<VerifyOtpInput> = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, { message: "Email is required" })
      .email({ message: "Invalid email address" }),
    otp: z.string().trim().length(6).optional(),
    code: z.string().trim().length(6).optional(),
  })
  .refine((data) => data.otp || data.code, {
    message: "Either otp or code must be provided",
    path: ["otp"],
  })
  .transform((data) => {
    return {
      email: data.email,
      otp: data.otp || data.code || "",
    }
  })
