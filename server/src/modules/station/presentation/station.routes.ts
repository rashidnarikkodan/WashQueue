import { Router } from "express"
import { StationController } from "./station.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import { createStationSchema, patchStationSchema } from "./schema/station.schema"

export const createRouter = (stationController: StationController): Router => {
  const router = Router()

  // All station routes require authentication
  router.use(authenticate)

  router.post(
    "/",
    validateRequest(createStationSchema),
    asyncHandler(stationController.create)
  )

  router.patch(
    "/:stationId",
    validateRequest(patchStationSchema),
    asyncHandler(stationController.update)
  )

  router.get(
    "/:stationId",
    asyncHandler(stationController.getById)
  )

  router.post(
    "/:stationId/submit",
    asyncHandler(stationController.submit)
  )

  return router
}