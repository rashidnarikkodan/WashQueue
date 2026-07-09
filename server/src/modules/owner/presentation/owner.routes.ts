import { Router } from "express"
import { OwnerController } from "./owner.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { API_ROUTES } from "@/common/constants/route.constants"

export const createOwnerRouter = (ownerController: OwnerController): Router => {
  const router = Router()

  router.post(API_ROUTES.OWNER.CREATE, authenticate, asyncHandler(ownerController.createOwner))
  router.get(API_ROUTES.OWNER.GET_PROFILE, authenticate, asyncHandler(ownerController.getOwnerProfile))
  router.patch(API_ROUTES.OWNER.UPDATE_PROFILE, authenticate, asyncHandler(ownerController.updateOwnerProfile))

  return router
}
