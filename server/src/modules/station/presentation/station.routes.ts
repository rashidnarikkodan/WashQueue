import { Router } from "express"
import { StationController } from "./station.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import { createStationSchema, patchStationSchema } from "./schema/station.schema"
import { authorize } from "@/infrastructure/http/middleware/authorize"
import { stationUpload } from "@/infrastructure/multer/multer.middleware"

export const createRouter = (stationController: StationController): Router => {
  const router = Router()

  // Public routes — list stations, filter metadata & get station by ID
  router.get(
    "/",
    asyncHandler(stationController.getStations)
  )

  router.get(
    "/filter-options",
    asyncHandler(stationController.getFilterOptions)
  )

  router.get(
    "/:stationId",
    asyncHandler(stationController.getById)
  )


  
  // Authenticated routes
  router.use(authenticate)

  router.patch(
    "/:stationId/review",
    authorize("admin"),
    asyncHandler(stationController.review)
  )

  router.post(
    "/",
    stationUpload,
    validateRequest(createStationSchema),
    asyncHandler(stationController.create)
  )

  router.patch(
    "/:stationId",
    stationUpload,
    validateRequest(patchStationSchema),
    asyncHandler(stationController.update)
  )

  router.post(
    "/:stationId/submit",
    asyncHandler(stationController.submit)
  )

  router.patch(
    "/:stationId/toggle-active",
    asyncHandler(stationController.toggleActive)
  )

  router.post(
    "/:stationId/assign-manager",
    asyncHandler(stationController.assignManager)
  )

  router.delete(
    "/:stationId",
    asyncHandler(stationController.delete)
  )

  return router
}