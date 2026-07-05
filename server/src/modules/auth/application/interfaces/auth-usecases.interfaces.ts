import { LoginInput } from "../dto/login.dto"
import { SignupInput } from "../dto/signup.dto"
import { VerifyOtpInput } from "../dto/verify-otp.dto"
import { ForgotPasswordInput } from "../dto/forgot-password.dto"
import { ResetPasswordInput } from "../dto/reset-password.dto"
import { AuthOutput, AuthUser } from "../dto/common/AuthUser.dto"
import { RoleType } from "@/common/constants/role.constants"

export interface ILoginUseCase {
  execute(data: LoginInput): Promise<AuthOutput>
}

export interface ISignupUseCase {
  execute(data: SignupInput): Promise<null>
}

export interface IVerifyOtpUseCase {
  execute(data: VerifyOtpInput): Promise<AuthOutput>
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
  execute(userId: string, role: RoleType): Promise<AuthUser>
}

export interface IGoogleAuthUseCase {
  execute(token: string): Promise<AuthOutput>
}

export interface IGetMeUseCase {
  execute(userId: string): Promise<AuthUser>
}

export interface IForgotPasswordUseCase {
  execute(data: ForgotPasswordInput): Promise<void>
}

export interface IResetPasswordUseCase {
  execute(data: ResetPasswordInput): Promise<void>
}
