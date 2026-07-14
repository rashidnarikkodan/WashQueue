import { Router } from "express"
import asyncHandler from "@/shared/utils/async-handler"
import { authenticate } from "@/shared/middleware/authenticate"
import { validateRequest } from "@/shared/middleware/validation.middleware"
import { onboardingUpload } from "@/infrastructure/storage/multer.middleware"
import { saveOnboardingStepSchema } from "../application/schema/save-onboarding-step.schema"
import { OwnerController } from "./owner.controller"

export const createOwnerRouter = (ownerController: OwnerController): Router => {
  const router = Router()

  // All owner routes require authentication
  router.use(authenticate)

  router.get(
    "/onboarding/status",
    asyncHandler(ownerController.getOnboardingStatus)
  )

  // Multer MUST run before validateRequest — it parses the multipart body first,
  // then Zod validates the resulting req.body text fields.
  router.post(
    "/onboarding/step",
    onboardingUpload,
    validateRequest(saveOnboardingStepSchema),
    asyncHandler(ownerController.saveOnboardingStep)
  )

  router.post(
    "/onboarding/submit",
    asyncHandler(ownerController.submitOnboarding)
  )

  return router
}
