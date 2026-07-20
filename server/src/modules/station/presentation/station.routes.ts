import { Router } from "express"
import { StationController } from "./station.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import { createStationSchema, patchStationSchema } from "./schema/station.schema"
import { authorize } from "@/infrastructure/http/middleware/authorize"

export const createRouter = (stationController: StationController): Router => {
  const router = Router()

  // Public route — list stations (for discovery/search, no auth needed)
  router.get(
    "/",
    asyncHandler(stationController.getStations)
  )

  // All routes below require authentication + owner authorization
  router.use(authenticate, authorize("owner"))

  router.get(
    "/:stationId",
    asyncHandler(stationController.getById)
  )

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

  router.post(
    "/:stationId/submit",
    asyncHandler(stationController.submit)
  )

  return router
}