import { LoginInput, LoginResponse } from "../dto/login.dto"
import { SignupInput, SignupResponse } from "../dto/signup.dto"
import { VerifyOtpInput, VerifyOtpResponse } from "../dto/verify-otp.dto"
import { SetupAccountResponse } from "../dto/setup-account.dto"
import { GoogleAuthResponse } from "../dto/google-auth.dto"
import { GetMeResponse } from "../dto/get-me.dto"
import { ForgotPasswordInput } from "../dto/forgot-password.dto"
import { ResetPasswordInput } from "../dto/reset-password.dto"
import { RoleType } from "@/shared/constants/role.constants"

export interface ILoginUseCase {
  execute(data: LoginInput): Promise<LoginResponse>
}

export interface ISignupUseCase {
  execute(data: SignupInput): Promise<SignupResponse>
}

export interface IVerifyOtpUseCase {
  execute(data: VerifyOtpInput): Promise<VerifyOtpResponse>
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
  execute(userId: string, role: RoleType): Promise<SetupAccountResponse>
}

export interface IGoogleAuthUseCase {
  execute(token: string): Promise<GoogleAuthResponse>
}

export interface IGetMeUseCase {
  execute(userId: string): Promise<GetMeResponse>
}

export interface IForgotPasswordUseCase {
  execute(data: ForgotPasswordInput): Promise<void>
}

export interface IResetPasswordUseCase {
  execute(data: ResetPasswordInput): Promise<void>
}
