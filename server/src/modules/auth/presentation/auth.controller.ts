import { Request, Response } from "express"
import { LoginUseCase } from "../application/use-cases/login.use-case"
import { SignupUseCase } from "../application/use-cases/signup.use-case"
import { VerifyOtpUseCase } from "../application/use-cases/verify-otp.use-case"
import { RefreshTokenUseCase } from "../application/use-cases/refresh-token.use-case"
import { LogoutUseCase } from "../application/use-cases/logout.use-case"
import { SetupAccountUseCase } from "../application/use-cases/setup-account.use-case"
import { GoogleAuthUseCase } from "../application/use-cases/google-auth.use-case"
import { GetMeUseCase } from "../application/use-cases/get-me.use-case"
import response from "@/shared/utils/response"
import { AuthenticatedRequest } from "@/shared/middleware/auth.middleware"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { setAuthCookies, clearAuthCookies } from "@/shared/utils/cookies"

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly signupUseCase: SignupUseCase,
    private readonly verifyOtpUseCase: VerifyOtpUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly setupAccountUseCase: SetupAccountUseCase,
    private readonly googleAuthUseCase: GoogleAuthUseCase,
    private readonly getMeUseCase: GetMeUseCase
  ) { }

  login = async (req: Request, res: Response) => {
    const { user, tokens } = await this.loginUseCase.execute(req.body)
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken)
    res.status(HTTP_STATUS.OK).json(
      response(user, 'Login successful')
    )
  }

  signup = async (req: Request, res: Response) => {
    const result = await this.signupUseCase.execute(req.body)
    res.status(201).json(response(result, "User registered. Please check your email for the OTP."))
  }

  verifyOtp = async (req: Request, res: Response) => {
    const { user, tokens } = await this.verifyOtpUseCase.execute(req.body)
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken)
    res.status(HTTP_STATUS.OK).json(response(user, "Verification successful"))
  }

  googleAuth = async (req: Request, res: Response) => {
    const { token } = req.body
    const { user, tokens } = await this.googleAuthUseCase.execute(token)
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken)
    res.status(HTTP_STATUS.OK).json(response(user, "Google Sign-In successful"))
  }

  refreshToken = async (req: Request, res: Response) => {
    let token: string | undefined = req.body.refreshToken

    if (!token && req.headers.cookie) {
      const cookies = Object.fromEntries(
        req.headers.cookie.split(";").map((c) => {
          const parts = c.trim().split("=")
          return [parts[0], parts.slice(1).join("=")]
        })
      )
      token = cookies.refreshToken
    }

    if (!token) {
      res.status(401).json(response(null, "Refresh token is missing"))
      return
    }

    const { accessToken, refreshToken: newRefreshToken } = await this.refreshTokenUseCase.execute(token)
    setAuthCookies(res, accessToken, newRefreshToken)
    res.status(HTTP_STATUS.OK).json(response(null, "Token refreshed successfully"))
  }

  setupAccount = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    const { role } = req.body
    if (!userId) {
      res.status(401).json(response(null, "Unauthorized"))
      return
    }
    const result = await this.setupAccountUseCase.execute(userId, role)
    res.status(HTTP_STATUS.OK).json(response(result, "Account setup successful"))
  }

  me = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(response(null, "Unauthorized"))
      return
    }
    const result = await this.getMeUseCase.execute(userId)
    res.status(HTTP_STATUS.OK).json(response(result.user, "User retrieved successfully"))
  }

  logout = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (userId) {
      await this.logoutUseCase.execute(userId)
    }
    clearAuthCookies(res)
    res.status(HTTP_STATUS.OK).json(response(null, "Logout successful"))
  }
}
