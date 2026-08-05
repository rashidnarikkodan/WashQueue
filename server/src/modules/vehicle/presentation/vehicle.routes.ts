import { Router } from "express"
import { VehicleController } from "./vehicle.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import { createVehicleSchema, updateVehicleSchema } from "./schema/vehicle.schema"
import { vehicleUpload } from "@/infrastructure/multer/multer.middleware"
import { API_ROUTES } from "@/common/constants/route.constants"

export const createVehicleRouter = (vehicleController: VehicleController): Router => {
  const router = Router()

  // All vehicle routes require authentication
  router.use(authenticate)

  router.post(
    API_ROUTES.VEHICLES.CREATE,
    vehicleUpload,
    validateRequest(createVehicleSchema),
    asyncHandler(vehicleController.create)
  )

  router.get(API_ROUTES.VEHICLES.LIST, asyncHandler(vehicleController.getAll))

  router.get(API_ROUTES.VEHICLES.BY_ID, asyncHandler(vehicleController.getById))

  router.patch(
    API_ROUTES.VEHICLES.BY_ID,
    validateRequest(updateVehicleSchema),
    asyncHandler(vehicleController.update)
  )

  router.delete(API_ROUTES.VEHICLES.BY_ID, asyncHandler(vehicleController.delete))

  router.patch(API_ROUTES.VEHICLES.SET_PRIMARY, asyncHandler(vehicleController.setPrimary))

  return router
}
