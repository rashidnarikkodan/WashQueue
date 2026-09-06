export const AUTH_PROVIDER = {
  GOOGLE: "GOOGLE",
  LOCAL: "LOCAL",
} as const

export type AuthProvider = (typeof AUTH_PROVIDER)[keyof typeof AUTH_PROVIDER]
