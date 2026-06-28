export const ROLE = {
  USER: "user",
  ADMIN: "admin",
  PROVIDER: "provider",
} as const
export type ROLE = (typeof ROLE)[keyof typeof ROLE]
