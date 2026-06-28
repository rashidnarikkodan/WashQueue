import { Router } from "express"
import * as authController from "./auth.controller"
import asyncHandler from "@/shared/utils/async-handler"

const router = Router()

router.post("/login", asyncHandler(authController.login))
router.post("/register", asyncHandler(authController.register))
router.post("/verify-otp", asyncHandler(authController.verifyOtp))
router.post("/logout", asyncHandler(authController.logout))

export default router
