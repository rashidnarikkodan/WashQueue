import { Request, Response } from "express"
import {
  ILoginUseCase,
  ISignupUseCase,
  IVerifyOtpUseCase,
  IRefreshTokenUseCase,
  ILogoutUseCase,
  ISetupAccountUseCase,
  IGoogleAuthUseCase,
  IGetMeUseCase,
  IForgotPasswordUseCase,
  IResetPasswordUseCase
} from "../application/interfaces/auth-usecases.interfaces"
import success from "@/shared/utils/success"
import { AuthenticatedRequest } from "@/shared/middleware/authenticate"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { setAuthCookies, clearAuthCookies } from "@/shared/utils/cookies"
import { SUCCESS_MESSAGES } from "@/shared/constants/app.constants"
import { ERROR_MESSAGES } from "@/shared/constants/error.constants"

export class AuthController {
  constructor(
    private readonly loginUseCase: ILoginUseCase,
    private readonly signupUseCase: ISignupUseCase,
    private readonly verifyOtpUseCase: IVerifyOtpUseCase,
    private readonly refreshTokenUseCase: IRefreshTokenUseCase,
    private readonly logoutUseCase: ILogoutUseCase,
    private readonly setupAccountUseCase: ISetupAccountUseCase,
    private readonly googleAuthUseCase: IGoogleAuthUseCase,
    private readonly getMeUseCase: IGetMeUseCase,
    private readonly forgotPasswordUseCase: IForgotPasswordUseCase,
    private readonly resetPasswordUseCase: IResetPasswordUseCase
  ) { }

  login = async (req: Request, res: Response) => {
    const { user, tokens } = await this.loginUseCase.execute(req.body)
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken)
    success(res, user, HTTP_STATUS.OK, SUCCESS_MESSAGES.LOGIN_SUCCESS)
  }

  signup = async (req: Request, res: Response) => {
    const result = await this.signupUseCase.execute(req.body)
    success(res, result, HTTP_STATUS.CREATED, SUCCESS_MESSAGES.SIGNUP_SUCCESS)
  }

  verifyOtp = async (req: Request, res: Response) => {
    const { user, tokens } = await this.verifyOtpUseCase.execute(req.body)
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken)
    success(res, user, HTTP_STATUS.OK, SUCCESS_MESSAGES.VERIFICATION_SUCCESS)
  }

  googleAuth = async (req: Request, res: Response) => {
    const { token } = req.body
    const { user, tokens } = await this.googleAuthUseCase.execute(token)
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken)
    success(res, user, HTTP_STATUS.OK, SUCCESS_MESSAGES.GOOGLE_SIGNIN_SUCCESS)
  }

  refreshToken = async (req: Request, res: Response) => {
    let token: string | undefined = req.body.refreshToken

    if (!token && req.cookies) {
      token = req.cookies.refreshToken
    }

    if (!token) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.REFRESH_TOKEN_REQUIRED,
        data: null,
      })
      return
    }

    const { accessToken, refreshToken: newRefreshToken } = await this.refreshTokenUseCase.execute(token)
    setAuthCookies(res, accessToken, newRefreshToken)
    success(res, null, HTTP_STATUS.OK, SUCCESS_MESSAGES.TOKEN_REFRESH_SUCCESS)
  }

  setupAccount = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    const { role } = req.body
    if (!userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        data: null,
      })
      return
    }
    const result = await this.setupAccountUseCase.execute(userId, role)
    success(res, result, HTTP_STATUS.OK, SUCCESS_MESSAGES.ACCOUNT_SETUP_SUCCESS)
  }

  me = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        data: null,
      })
      return
    }
    const result = await this.getMeUseCase.execute(userId)
    success(res, result.user, HTTP_STATUS.OK, SUCCESS_MESSAGES.USER_RETRIEVED_SUCCESS)
  }

  logout = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (userId) {
      await this.logoutUseCase.execute(userId)
    }
    clearAuthCookies(res)
    success(res, null, HTTP_STATUS.OK, SUCCESS_MESSAGES.LOGOUT_SUCCESS)
  }

  forgotPassword = async (req: Request, res: Response) => {
    await this.forgotPasswordUseCase.execute(req.body)
    success(res, null, HTTP_STATUS.OK, SUCCESS_MESSAGES.PASSWORD_RESET_OTP_SENT)
  }

  resetPassword = async (req: Request, res: Response) => {
    await this.resetPasswordUseCase.execute(req.body)
    success(res, null, HTTP_STATUS.OK, SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS)
  }
}
