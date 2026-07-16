import { userRepository } from "../user/user.module"
import { MailService } from "./infrastructure/services/mail.service"
import { OtpService } from "./infrastructure/services/otp.service"
import { TokenService } from "./infrastructure/services/token.service"
import { Argon2HashService } from "./infrastructure/services/hash.service"

import { OtpRedisRepository } from "./infrastructure/repository/otp.redis.repository"
import { RefreshTokenMongoRepository } from "./infrastructure/repository/refresh-token.mongo.repository"

import { SignupUseCase } from "./application/use-cases/signup.use-case"
import { VerifyOtpUseCase } from "./application/use-cases/verify-otp.use-case"
import { LoginUseCase } from "./application/use-cases/login.use-case"
import { RefreshTokenUseCase } from "./application/use-cases/refresh-token.use-case"
import { LogoutUseCase } from "./application/use-cases/logout.use-case"
import { GoogleAuthUseCase } from "./application/use-cases/google-auth.use-case"
import { GetMeUseCase } from "./application/use-cases/get-me.use-case"
import { ForgotPasswordUseCase } from "./application/use-cases/forgot-password.use-case"
import { ResetPasswordUseCase } from "./application/use-cases/reset-password.use-case"

// router and controller
import { AuthController } from "./presentation/auth.controller"
import { createAuthRouter } from "./presentation/auth.routes"

import { OwnerMongoRepository } from "../owner/infrastructure/repository/owner.mongo.repository"

// infrastructures/repositories
const otpRepository = new OtpRedisRepository()
const refreshTokenRepository = new RefreshTokenMongoRepository()
const ownerRepository = new OwnerMongoRepository()

const mailService = new MailService()
const otpService = new OtpService(otpRepository)
const tokenService = new TokenService()
const hashService = new Argon2HashService()

const signupUseCase = new SignupUseCase(userRepository, otpRepository, otpService, mailService, hashService)
const verifyOtpUseCase = new VerifyOtpUseCase(userRepository, otpRepository, refreshTokenRepository, otpService, tokenService, hashService)
const loginUseCase = new LoginUseCase(userRepository, refreshTokenRepository, tokenService, hashService)
const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, refreshTokenRepository, tokenService, hashService)
const logoutUseCase = new LogoutUseCase(refreshTokenRepository)
const googleAuthUseCase = new GoogleAuthUseCase(userRepository, refreshTokenRepository, tokenService, hashService)
const getMeUseCase = new GetMeUseCase(userRepository, ownerRepository)
const forgotPasswordUseCase = new ForgotPasswordUseCase(userRepository, otpRepository, otpService, mailService)
const resetPasswordUseCase = new ResetPasswordUseCase(userRepository, otpRepository, hashService)

const authController = new AuthController(
  loginUseCase,
  signupUseCase,
  verifyOtpUseCase,
  refreshTokenUseCase,
  logoutUseCase,
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


