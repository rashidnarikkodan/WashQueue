import { Router } from "express"
import { OwnerController } from "./owner.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import { onboardingUpload } from "@/infrastructure/multer/multer.middleware"
import { saveOnboardingStepSchema } from "./schema/save-onboarding-step.schema"
import { API_ROUTES } from "@/common/constants/route.constants"

export const createOwnerRouter = (ownerController: OwnerController): Router => {
  const router = Router()

  // All owner routes require authentication
  router.use(authenticate)

  router.get(API_ROUTES.OWNER.ONBOARDING_STATUS, asyncHandler(ownerController.getOnboardingStatus))

  router.post(
    API_ROUTES.OWNER.ONBOARDING_STEP,
    onboardingUpload,
    validateRequest(saveOnboardingStepSchema),
    asyncHandler(ownerController.saveOnboardingStep)
  )

  router.post(API_ROUTES.OWNER.ONBOARDING_SUBMIT, asyncHandler(ownerController.submitOnboarding))

  router.post(API_ROUTES.OWNER.CREATE, asyncHandler(ownerController.createOwner))
  router.get(API_ROUTES.OWNER.GET_PROFILE, asyncHandler(ownerController.getOwnerProfile))
  router.patch(API_ROUTES.OWNER.UPDATE_PROFILE, asyncHandler(ownerController.updateOwnerProfile))

  return router
}
