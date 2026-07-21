import { Router } from "express"
import { VehicleController } from "./vehicle.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import { createVehicleSchema, updateVehicleSchema } from "./schema/vehicle.schema"
import { vehicleUpload } from "@/infrastructure/multer/multer.middleware"

export const createVehicleRouter = (vehicleController: VehicleController): Router => {
  const router = Router()

  // All vehicle routes require authentication
  router.use(authenticate)

  router.post(
    "/",
    vehicleUpload,
    validateRequest(createVehicleSchema),
    asyncHandler(vehicleController.create)
  )

  router.get(
    "/",
    asyncHandler(vehicleController.getAll)
  )

  router.get(
    "/:id",
    asyncHandler(vehicleController.getById)
  )

  router.patch(
    "/:id",
    validateRequest(updateVehicleSchema),
    asyncHandler(vehicleController.update)
  )

  router.delete(
    "/:id",
    asyncHandler(vehicleController.delete)
  )

  router.patch(
    "/:id/primary",
    asyncHandler(vehicleController.setPrimary)
  )

  return router
}
