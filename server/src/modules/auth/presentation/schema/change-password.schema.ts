import z from "zod"
import { ChangePasswordInput } from "../../application/dto/change-password.dto"

export const changePasswordSchema: z.ZodType<ChangePasswordInput> = z
  .object({
    currentPassword: z.string().min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(1, { message: "New password is required" })
      .min(8, { message: "Password must be at least 8 characters" })
      .max(128, { message: "Password must not exceed 128 characters" }),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password cannot be the same as current password",
    path: ["newPassword"],
  })
  .transform((data) => ({
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
  }))
