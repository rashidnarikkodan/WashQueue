import { Router } from "express"
import { BookingController } from "./booking.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import {
  advanceStatusSchema,
  cancelBookingSchema,
  checkInBookingSchema,
  createBookingSchema,
  createWalkInBookingSchema,
} from "./schema/booking.schema"

export const createBookingRouter = (bookingController: BookingController): Router => {
  const router = Router()

  router.use(authenticate)

  // Customer Routes
  router.post("/", validateRequest(createBookingSchema), asyncHandler(bookingController.create))

  router.get("/", asyncHandler(bookingController.getUserBookings))
  router.get("/upcoming", asyncHandler(bookingController.getUpcoming))
  router.get("/history", asyncHandler(bookingController.getHistory))
  router.get("/:bookingId", asyncHandler(bookingController.getById))
  router.get("/:bookingId/invoice", asyncHandler(bookingController.downloadInvoice))

  router.patch(
    "/:bookingId/cancel",
    validateRequest(cancelBookingSchema),
    asyncHandler(bookingController.cancel)
  )

  // Manager / Staff Routes
  router.post(
    "/walk-in",
    validateRequest(createWalkInBookingSchema),
    asyncHandler(bookingController.createWalkIn)
  )

  router.post(
    "/check-in",
    validateRequest(checkInBookingSchema),
    asyncHandler(bookingController.checkIn)
  )

  router.patch(
    "/:bookingId/status",
    validateRequest(advanceStatusSchema),
    asyncHandler(bookingController.advanceStatus)
  )

  return router
}
