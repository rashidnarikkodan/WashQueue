import z from "zod";
import { ResetPasswordInput } from "../../application/dto/reset-password.dto";

export const resetPasswordSchema: z.ZodType<ResetPasswordInput> = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),

  code: z
    .string()
    .trim()
    .length(6, { message: "OTP code must be exactly 6 digits" })
    .regex(/^\d+$/, { message: "OTP must contain only digits" }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must not exceed 128 characters" })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/\d/, {
      message: "Password must contain at least one number",
    })
    .regex(/[!@#$%^&*()_\-+=\[{\]};:'",<.>/?\\|`~]/, {
      message: "Password must contain at least one special character",
    }),
});