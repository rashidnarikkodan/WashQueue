export const ROLE = {
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
  PROVIDER: "PROVIDER",
  MANAGER: "MANAGER"
} as const
export type ROLE = (typeof ROLE)[keyof typeof ROLE]
