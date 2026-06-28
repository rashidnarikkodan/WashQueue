import { Router } from "express"
import { AuthController } from "./auth.controller"
import asyncHandler from "@/shared/utils/async-handler"
import { validateRequest } from "@/shared/middleware/validation.middleware"
import { authenticate } from "@/shared/middleware/auth.middleware"
import { loginSchema } from "../application/schema/login.schema"
import { signupSchema } from "../application/schema/signup.schema"
import { verifyOtpSchema } from "../application/schema/verify-otp.schema"

export const createAuthRouter = (authController: AuthController): Router => {
  const router = Router()

  router.post(
    "/signup",
    validateRequest(signupSchema),
    asyncHandler(authController.signup)
  )

  router.post(
    "/login",
    validateRequest(loginSchema),
    asyncHandler(authController.login)
  )

  router.post(
    "/verify-otp",
    validateRequest(verifyOtpSchema),
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

  router.post(
    "/logout",
    authenticate,
    asyncHandler(authController.logout)
  )

  return router
}


