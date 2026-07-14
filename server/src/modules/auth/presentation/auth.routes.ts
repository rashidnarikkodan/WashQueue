import { Router } from "express"
import { AuthController } from "./auth.controller"
import asyncHandler from "@/common/utils/async-handler"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { loginSchema } from "./schema/login.schema"
import { signupSchema } from "./schema/signup.schema"
import { verifyOtpSchema } from "./schema/verify-otp.schema"
import { forgotPasswordSchema } from "./schema/forgot-password.schema"
import { resetPasswordSchema } from "./schema/reset-password.schema"
import { API_ROUTES } from "@/common/constants/route.constants"

export const createAuthRouter = (authController: AuthController): Router => {
  const router = Router()

  router.post(
    API_ROUTES.AUTH.SIGNUP,
    validateRequest(signupSchema, 'body'),
    asyncHandler(authController.signup)
  )

  router.post(
    API_ROUTES.AUTH.LOGIN,
    validateRequest(loginSchema, 'body'),
    asyncHandler(authController.login)
  )

  router.post(
    API_ROUTES.AUTH.VERIFY_OTP,
    validateRequest(verifyOtpSchema, 'body'),
    asyncHandler(authController.verifyOtp)
  )

  router.post(
    API_ROUTES.AUTH.GOOGLE,
    asyncHandler(authController.googleAuth)
  )

  router.post(
    API_ROUTES.AUTH.REFRESH_TOKEN,
    asyncHandler(authController.refreshToken)
  )

  router.post(
    API_ROUTES.AUTH.SETUP_ACCOUNT,
    authenticate,
    asyncHandler(authController.setupAccount)
  )

  router.get(
    API_ROUTES.AUTH.ME,
    authenticate,
    asyncHandler(authController.me)
  )

  router.post(
    API_ROUTES.AUTH.LOGOUT,
    authenticate,
    asyncHandler(authController.logout)
  )

  router.post(
    API_ROUTES.AUTH.FORGOT_PASSWORD,
    validateRequest(forgotPasswordSchema),
    asyncHandler(authController.forgotPassword)
  )

  router.post(
    API_ROUTES.AUTH.RESET_PASSWORD,
    validateRequest(resetPasswordSchema),
    asyncHandler(authController.resetPassword)
  )

  return router
}


