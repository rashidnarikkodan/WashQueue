import { Router } from "express"
import { StationController } from "./station.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import { createStationSchema, patchStationSchema } from "./schema/station.schema"
import { authorize } from "@/infrastructure/http/middleware/authorize"
import { stationUpload } from "@/infrastructure/multer/multer.middleware"

const parseStationFormData = (req: any, res: any, next: any) => {
  if (req.body) {
    if (typeof req.body.contact === "string") req.body.contact = JSON.parse(req.body.contact)
    if (typeof req.body.location === "string") req.body.location = JSON.parse(req.body.location)
    if (typeof req.body.address === "string") req.body.address = JSON.parse(req.body.address)
    if (typeof req.body.images === "string") req.body.images = JSON.parse(req.body.images)
    if (typeof req.body.step === "string") req.body.step = parseInt(req.body.step, 10)
    if (typeof req.body.operatingHours === "string") req.body.operatingHours = JSON.parse(req.body.operatingHours)
    if (typeof req.body.holidays === "string") req.body.holidays = JSON.parse(req.body.holidays)
    if (typeof req.body.slotConfig === "string") req.body.slotConfig = JSON.parse(req.body.slotConfig)
    if (typeof req.body.pricing === "string") req.body.pricing = JSON.parse(req.body.pricing)
    if (typeof req.body.amenities === "string") req.body.amenities = JSON.parse(req.body.amenities)
    if (typeof req.body.extraServices === "string") req.body.extraServices = JSON.parse(req.body.extraServices)
  }
  next()
}

export const createRouter = (stationController: StationController): Router => {
  const router = Router()

  // Public route — list stations (for discovery/search, no auth needed)
  router.get(
    "/",
    asyncHandler(stationController.getStations)
  )
  
  router.get(
    "/:stationId",
    asyncHandler(stationController.getById)
  )
  
  // Admin route to approve/reject station
  router.patch(
    "/:stationId/review",
    authenticate,
    authorize("admin"),
    asyncHandler(stationController.review)
  )

  // All routes below require authentication + owner authorization
  router.use(authenticate, authorize("owner"))


  router.post(
    "/",
    stationUpload,
    parseStationFormData,
    validateRequest(createStationSchema),
    asyncHandler(stationController.create)
  )

  router.patch(
    "/:stationId",
    stationUpload,
    parseStationFormData,
    validateRequest(patchStationSchema),
    asyncHandler(stationController.update)
  )

  router.post(
    "/:stationId/submit",
    asyncHandler(stationController.submit)
  )

  return router
}