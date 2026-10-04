export const ROLE = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  OWNER: "owner",
  MANAGER: "manager",
} as const

export const RoleType = ROLE
export type RoleType = (typeof ROLE)[keyof typeof ROLE]
