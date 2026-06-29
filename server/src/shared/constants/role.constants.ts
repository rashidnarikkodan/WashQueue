export const ROLE = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  PROVIDER: "provider",
  MANAGER: "manager"
} as const
export type RoleType = (typeof ROLE)[keyof typeof ROLE]
