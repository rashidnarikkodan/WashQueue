import { MongooseUserRepository } from "./infrastructure/repositories/mongoose-user.repository"
import { MailService } from "@/infrastructure/mail/mail.service"
import { OtpService } from "./application/services/otp.service"
import { TokenService } from "./application/services/token.service"

import { RegisterUseCase } from "./application/use-cases/register.use-case"
import { VerifyOtpUseCase } from "./application/use-cases/verify-otp.use-case"
import { LoginUseCase } from "./application/use-cases/login.use-case"
import { RefreshTokenUseCase } from "./application/use-cases/refresh-token.use-case"
import { LogoutUseCase } from "./application/use-cases/logout.use-case"
import { SetupAccountUseCase } from "./application/use-cases/setup-account.use-case"
import { GoogleAuthUseCase } from "./application/use-cases/google-auth.use-case"

import { AuthController } from "./presentation/auth.controller"
import { createAuthRouter } from "./presentation/auth.routes"

const userRepository = new MongooseUserRepository()
const mailService = new MailService()
const otpService = new OtpService()
const tokenService = new TokenService()

const registerUseCase = new RegisterUseCase(userRepository, otpService, mailService)
const verifyOtpUseCase = new VerifyOtpUseCase(userRepository, otpService, tokenService)
const loginUseCase = new LoginUseCase(userRepository, tokenService)
const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, tokenService)
const logoutUseCase = new LogoutUseCase(userRepository)
const setupAccountUseCase = new SetupAccountUseCase(userRepository)
const googleAuthUseCase = new GoogleAuthUseCase(userRepository, tokenService)

const authController = new AuthController(
  loginUseCase,
  registerUseCase,
  verifyOtpUseCase,
  refreshTokenUseCase,
  logoutUseCase,
  setupAccountUseCase,
  googleAuthUseCase
)

const authRouter = createAuthRouter(authController)

export {
  userRepository,
  mailService,
  otpService,
  tokenService,
  registerUseCase,
  verifyOtpUseCase,
  loginUseCase,
  refreshTokenUseCase,
  logoutUseCase,
  authController,
  authRouter,
}
export default authRouter


