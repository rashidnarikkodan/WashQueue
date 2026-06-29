import { Router } from "express"
import { AuthController } from "./auth.controller"
import asyncHandler from "@/shared/utils/async-handler"
import { validateRequest } from "@/shared/middleware/validation.middleware"
import { authenticate } from "@/shared/middleware/authenticate"
import { loginSchema } from "../application/schema/login.schema"
import { signupSchema } from "../application/schema/signup.schema"
import { verifyOtpSchema } from "../application/schema/verify-otp.schema"
import { forgotPasswordSchema } from "../application/schema/forgot-password.schema"
import { resetPasswordSchema } from "../application/schema/reset-password.schema"

export const createAuthRouter = (authController: AuthController): Router => {
  const router = Router()

  router.post(
    "/signup",
    validateRequest(signupSchema, 'body'),
    asyncHandler(authController.signup)
  )

  router.post(
    "/login",
    validateRequest(loginSchema, 'body'),
    asyncHandler(authController.login)
  )

  router.post(
    "/verify-otp",
    validateRequest(verifyOtpSchema, 'body'),
    asyncHandler(authController.verifyOtp)
  )

  router.post(
    "/google",
    asyncHandler(authController.googleAuth)
  )

  router.post(
    "/refresh-token",
    asyncHandler(authController.refreshToken)
  )

  router.post(
    "/setup-account",
    authenticate,
    asyncHandler(authController.setupAccount)
  )

  router.get(
    "/me",
    authenticate,
    asyncHandler(authController.me)
  )

  router.post(
    "/logout",
    authenticate,
    asyncHandler(authController.logout)
  )

  router.post(
    "/forgot-password",
    validateRequest(forgotPasswordSchema, 'body'),
    asyncHandler(authController.forgotPassword)
  )

  router.post(
    "/reset-password",
    validateRequest(resetPasswordSchema, 'body'),
    asyncHandler(authController.resetPassword)
  )

  return router
}


