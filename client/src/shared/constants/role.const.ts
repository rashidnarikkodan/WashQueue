export const ROLE = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  OWNER: "owner",
  MANAGER: "manager",
} as const
export type RoleType = (typeof ROLE)[keyof typeof ROLE]

export const VIEW_MODE = {
  CUSTOMER: "customer",
  OWNER: "owner",
  MANAGER: "manager",
} as const
export type ViewModeType = (typeof VIEW_MODE)[keyof typeof VIEW_MODE]
