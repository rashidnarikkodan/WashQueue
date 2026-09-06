import { z } from "zod"
import { ManagerPermission } from "../../domain/entities/ManagerAssignment"

const permissionEnum = z.nativeEnum(ManagerPermission)

export const inviteManagerSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  stationId: z.string().min(1, "Station ID is required"),
  permissions: z.array(permissionEnum).min(1, "At least one permission must be assigned"),
})

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
})

export const updatePermissionsSchema = z.object({
  permissions: z.array(permissionEnum).min(1, "At least one permission must be assigned"),
})
