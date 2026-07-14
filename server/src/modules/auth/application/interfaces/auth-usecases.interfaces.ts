import { LoginInput } from "../schema/login.schema"
import { SignupInput } from "../schema/signup.schema"
import { VerifyOtpInput } from "../schema/verify-otp.schema"
import { ForgotPasswordInput } from "../schema/forgot-password.schema"
import { ResetPasswordInput } from "../schema/reset-password.schema"
import { RoleType } from "@/shared/constants/role.constants"
import { LoginResponse } from "../use-cases/login.use-case"

export interface ILoginUseCase {
  execute(data: LoginInput): Promise<LoginResponse>
}

export interface ISignupUseCase {
  execute(data: SignupInput): Promise<{
    id: string
    name?: string
    email: string
    role: string
    isVerified: boolean
  }>
}

export interface IVerifyOtpUseCase {
  execute(data: VerifyOtpInput): Promise<{
    user: {
      id: string
      name?: string
      email: string
      role: string
      isVerified: boolean
    }
    tokens: {
      accessToken: string
      refreshToken: string
    }
  }>
}

export interface IRefreshTokenUseCase {
  execute(refreshToken: string): Promise<{
    accessToken: string
    refreshToken: string
  }>
}

export interface ILogoutUseCase {
  execute(userId: string): Promise<void>
}

export interface ISetupAccountUseCase {
  execute(userId: string, role: RoleType): Promise<{
    user: {
      id: string
      name?: string
      email: string
      role: RoleType
      isVerified: boolean
    }
    tokens: {
      accessToken: string
      refreshToken: string
    }
  }>
}

export interface IGoogleAuthUseCase {
  execute(token: string): Promise<{
    user: {
      id: string
      name?: string
      email: string
      role: string
      isVerified: boolean
      isNewUser: boolean
    }
    tokens: {
      accessToken: string
      refreshToken: string
    }
  }>
}

export interface IGetMeUseCase {
  execute(userId: string): Promise<{
    user: {
      id: string
      name?: string
      email: string
      phone?: string
      role: string
      avatar?: string
      walletBalance: number
      isVerified: boolean
      onboardingStep: number
    }
  }>
}

export interface IForgotPasswordUseCase {
  execute(data: ForgotPasswordInput): Promise<void>
}

export interface IResetPasswordUseCase {
  execute(data: ResetPasswordInput): Promise<void>
}
