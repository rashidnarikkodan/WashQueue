import { ROLE } from "@/shared/constants/role.constants"
import z from "zod"

export const usersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),

  limit: z.coerce.number().min(1).max(100).default(10),

  search: z.string().trim().optional(),

  role: z
    .enum([ROLE.CUSTOMER, ROLE.OWNER, ROLE.MANAGER, ROLE.ADMIN])
    .optional(),

  isBlocked: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),

  sortBy: z
    .enum(["createdAt", "name", "email"])
    .default("createdAt"),

  sortOrder: z
    .enum(["asc", "desc"])
    .default("desc"),
})

export type GetUsersQuery = z.infer<typeof usersQuerySchema>