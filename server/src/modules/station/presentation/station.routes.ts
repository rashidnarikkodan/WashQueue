import { Router } from "express"
import { StationController } from "./station.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate, optionalAuthenticate } from "@/infrastructure/http/middleware/authenticate"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import { createStationSchema, getStationsQuery, patchStationSchema } from "./schema/station.schema"
import { authorize } from "@/infrastructure/http/middleware/authorize"
import { stationUpload } from "@/infrastructure/multer/multer.middleware"
import { API_ROUTES } from "@/common/constants/route.constants"

export const createRouter = (stationController: StationController): Router => {
  const router = Router()


  router.get(API_ROUTES.STATIONS.LIST, optionalAuthenticate, validateRequest(getStationsQuery,'query'), asyncHandler(stationController.getStations))

  router.get(API_ROUTES.STATIONS.FILTER_OPTIONS, asyncHandler(stationController.getFilterOptions))

  router.get("/:stationId/booking-calendar", asyncHandler(stationController.getBookingCalendar))

  router.get("/:stationId/time-windows", asyncHandler(stationController.getAvailableTimeWindows))

  router.get("/:stationId/slot-config", asyncHandler(stationController.getSlotConfig))

  router.get(API_ROUTES.STATIONS.BY_ID, asyncHandler(stationController.getById))


  router.use(authenticate)

  router.put("/:stationId/slot-config", asyncHandler(stationController.configureSlotConfig))

  router.post(
    API_ROUTES.STATIONS.CREATE,
    stationUpload,
    validateRequest(createStationSchema),
    asyncHandler(stationController.create)
  )

  router.patch(
    API_ROUTES.STATIONS.BY_ID,
    stationUpload,
    validateRequest(patchStationSchema),
    asyncHandler(stationController.update)
  )

  router.post(API_ROUTES.STATIONS.SUBMIT, asyncHandler(stationController.submitForReview))

  router.patch(API_ROUTES.STATIONS.TOGGLE_ACTIVE, asyncHandler(stationController.toggleActive))


  router.patch(
    API_ROUTES.STATIONS.REVIEW,
    authorize("admin"),
    asyncHandler(stationController.review)
  )

  router.delete(API_ROUTES.STATIONS.BY_ID, asyncHandler(stationController.delete))

  return router
}
