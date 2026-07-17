import { ROLE } from "@/common/constants/role.constants"
import z from "zod"
import { GetUsersQuery } from "../../application/dto/get-users.dto"

export const usersQuerySchema: z.ZodType<GetUsersQuery> = z.object({
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

  isVerified: z
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
