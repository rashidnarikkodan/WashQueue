import { MongooseUserRepository } from "./infrastructure/repositories/mongoose-user.repository"
import { MailService } from "@/infrastructure/mail/mail.service"
import { OtpService } from "./application/services/otp.service"
import { TokenService } from "./application/services/token.service"

import { SignupUseCase } from "./application/use-cases/signup.use-case"
import { VerifyOtpUseCase } from "./application/use-cases/verify-otp.use-case"
import { LoginUseCase } from "./application/use-cases/login.use-case"
import { RefreshTokenUseCase } from "./application/use-cases/refresh-token.use-case"
import { LogoutUseCase } from "./application/use-cases/logout.use-case"
import { SetupAccountUseCase } from "./application/use-cases/setup-account.use-case"
import { GoogleAuthUseCase } from "./application/use-cases/google-auth.use-case"
import { GetMeUseCase } from "./application/use-cases/get-me.use-case"

// router and controller
import { AuthController } from "./presentation/auth.controller"
import { createAuthRouter } from "./presentation/auth.routes"

// infrastructures
const userRepository = new MongooseUserRepository()
const mailService = new MailService()
const otpService = new OtpService()
const tokenService = new TokenService()

const signupUseCase = new SignupUseCase(userRepository, otpService, mailService)
const verifyOtpUseCase = new VerifyOtpUseCase(userRepository, otpService, tokenService)
const loginUseCase = new LoginUseCase(userRepository, tokenService)
const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, tokenService)
const logoutUseCase = new LogoutUseCase(userRepository)
const setupAccountUseCase = new SetupAccountUseCase(userRepository)
const googleAuthUseCase = new GoogleAuthUseCase(userRepository, tokenService)
const getMeUseCase = new GetMeUseCase(userRepository)

const authController = new AuthController(
  loginUseCase,
  signupUseCase,
  verifyOtpUseCase,
  refreshTokenUseCase,
  logoutUseCase,
  setupAccountUseCase,
  googleAuthUseCase,
  getMeUseCase
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


