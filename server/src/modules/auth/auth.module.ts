import { UserRepository } from "../user/infrastructure/repository/user.repository"
import { MailService } from "@/shared/infrastructure/mail/mail.service"
import { OtpService } from "./infrastructure/services/otp.service"
import { TokenService } from "./infrastructure/services/token.service"
import { Argon2HashService } from "./infrastructure/services/hash.service"

import { SignupUseCase } from "./application/use-cases/signup.use-case"
import { VerifyOtpUseCase } from "./application/use-cases/verify-otp.use-case"
import { LoginUseCase } from "./application/use-cases/login.use-case"
import { RefreshTokenUseCase } from "./application/use-cases/refresh-token.use-case"
import { LogoutUseCase } from "./application/use-cases/logout.use-case"
import { SetupAccountUseCase } from "./application/use-cases/setup-account.use-case"
import { GoogleAuthUseCase } from "./application/use-cases/google-auth.use-case"
import { GetMeUseCase } from "./application/use-cases/get-me.use-case"
import { ForgotPasswordUseCase } from "./application/use-cases/forgot-password.use-case"
import { ResetPasswordUseCase } from "./application/use-cases/reset-password.use-case"

// router and controller
import { AuthController } from "./presentation/auth.controller"
import { createAuthRouter } from "./presentation/auth.routes"

// infrastructures
const userRepository = new UserRepository()
const mailService = new MailService()
const otpService = new OtpService()
const tokenService = new TokenService()
const hashService = new Argon2HashService()

const signupUseCase = new SignupUseCase(userRepository, otpService, mailService, hashService)
const verifyOtpUseCase = new VerifyOtpUseCase(userRepository, otpService, tokenService, hashService)
const loginUseCase = new LoginUseCase(userRepository, tokenService, hashService)
const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, tokenService, hashService)
const logoutUseCase = new LogoutUseCase(userRepository)
const setupAccountUseCase = new SetupAccountUseCase(userRepository)
const googleAuthUseCase = new GoogleAuthUseCase(userRepository, tokenService, hashService)
const getMeUseCase = new GetMeUseCase(userRepository)
const forgotPasswordUseCase = new ForgotPasswordUseCase(userRepository, otpService, mailService)
const resetPasswordUseCase = new ResetPasswordUseCase(userRepository, otpService, hashService)

const authController = new AuthController(
  loginUseCase,
  signupUseCase,
  verifyOtpUseCase,
  refreshTokenUseCase,
  logoutUseCase,
  setupAccountUseCase,
  googleAuthUseCase,
  getMeUseCase,
  forgotPasswordUseCase,
  resetPasswordUseCase
)

const authRouter = createAuthRouter(authController)

export {
  userRepository,
  mailService,
  otpService,
  tokenService,
  signupUseCase,
  verifyOtpUseCase,
  loginUseCase,
  refreshTokenUseCase,
  logoutUseCase,
  getMeUseCase,
  authController,
  authRouter,
}
export default authRouter


