import { Request, Response } from "express"
import { LoginUseCase } from "../application/use-cases/login.use-case"
import { RegisterUseCase } from "../application/use-cases/register.use-case"
import { VerifyOtpUseCase } from "../application/use-cases/verify-otp.use-case"
import { RefreshTokenUseCase } from "../application/use-cases/refresh-token.use-case"
import { LogoutUseCase } from "../application/use-cases/logout.use-case"
import { SetupAccountUseCase } from "../application/use-cases/setup-account.use-case"
import { GoogleAuthUseCase } from "../application/use-cases/google-auth.use-case"
import response from "@/shared/utils/response"
import { AuthenticatedRequest } from "@/shared/middleware/auth.middleware"

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly verifyOtpUseCase: VerifyOtpUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly setupAccountUseCase: SetupAccountUseCase,
    private readonly googleAuthUseCase: GoogleAuthUseCase
  ) {}

  login = async (req: Request, res: Response) => {
    const result = await this.loginUseCase.execute(req.body)
    res.status(200).json(response(result, "Login successful"))
  }

  register = async (req: Request, res: Response) => {
    const result = await this.registerUseCase.execute(req.body)
    res.status(201).json(response(result, "User registered. Please check your email for the OTP."))
  }

  verifyOtp = async (req: Request, res: Response) => {
    const result = await this.verifyOtpUseCase.execute(req.body)
    res.status(200).json(response(result, "Verification successful"))
  }

  googleAuth = async (req: Request, res: Response) => {
    const { token } = req.body
    const result = await this.googleAuthUseCase.execute(token)
    res.status(200).json(response(result, "Google Sign-In successful"))
  }

  refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body
    const result = await this.refreshTokenUseCase.execute(refreshToken)
    res.status(200).json(response(result, "Token refreshed successfully"))
  }

  setupAccount = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    const { role } = req.body
    if (!userId) {
      res.status(401).json(response(null, "Unauthorized"))
      return
    }
    const result = await this.setupAccountUseCase.execute(userId, role)
    res.status(200).json(response(result, "Account setup successful"))
  }

  logout = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (userId) {
      await this.logoutUseCase.execute(userId)
    }
    res.status(200).json(response(null, "Logout successful"))
  }
}



