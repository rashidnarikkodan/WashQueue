import { RoleType } from "@/common/constants/role.constants"

export interface AuthUser {
  id: string
  name?: string
  email: string
  role: RoleType
  avatar?: string
  isNewUser?: boolean
  isVerified: boolean
  phone?: string
  walletBalance?: number
  onboardingStep?: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthOutput {
  user: AuthUser
  tokens: AuthTokens
}
