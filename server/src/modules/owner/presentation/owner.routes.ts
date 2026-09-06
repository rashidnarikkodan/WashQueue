import { Router } from "express"
import { OwnerController } from "./owner.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { authorize } from "@/infrastructure/http/middleware/authorize"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import { onboardingUpload } from "@/infrastructure/multer/multer.middleware"
import { saveOnboardingStepSchema } from "./schema/save-onboarding-step.schema"
import { createOwnerSchema, updateOwnerSchema } from "./schema/owner.schema"
import { approveOwnerSchema } from "./schema/approve-owner.schema"
import { API_ROUTES } from "@/common/constants/route.constants"
import { ROLE } from "@/common/constants/role.constants"

export const createOwnerRouter = (ownerController: OwnerController): Router => {
  const router = Router()

  router.use(authenticate)

  router.get(API_ROUTES.OWNER.ONBOARDING_STATUS, asyncHandler(ownerController.getOnboardingStatus))

  router.post(
    API_ROUTES.OWNER.ONBOARDING_STEP,
    onboardingUpload,
    validateRequest(saveOnboardingStepSchema),
    asyncHandler(ownerController.saveOnboardingStep)
  )

  router.post(API_ROUTES.OWNER.ONBOARDING_SUBMIT, asyncHandler(ownerController.submitOnboarding))

  router.post(
    API_ROUTES.OWNER.CREATE,
    validateRequest(createOwnerSchema),
    asyncHandler(ownerController.createOwner)
  )

  router.get(API_ROUTES.OWNER.GET_PROFILE, asyncHandler(ownerController.getOwnerProfile))

  router.patch(
    API_ROUTES.OWNER.UPDATE_PROFILE,
    validateRequest(updateOwnerSchema),
    asyncHandler(ownerController.updateOwnerProfile)
  )

  router.patch(
    API_ROUTES.OWNER.APPROVAL,
    authorize(ROLE.ADMIN),
    validateRequest(approveOwnerSchema),
    asyncHandler(ownerController.approveOwner)
  )

  return router
}
