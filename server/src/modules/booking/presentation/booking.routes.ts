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

  // Operational Queue Routes
  router.get("/queue/live", asyncHandler(bookingController.getLiveQueue))
  router.get("/stations/:stationId/queue", asyncHandler(bookingController.getLiveQueue))

  // Manager / Staff Routes
  router.post(
    "/validate-qr",
    validateRequest(checkInBookingSchema),
    asyncHandler(bookingController.validateQr)
  )

  router.post(
    "/:bookingId/pre-inspection",
    asyncHandler(bookingController.submitPreInspection)
  )

  router.post(
    "/:bookingId/post-inspection",
    asyncHandler(bookingController.submitPostInspection)
  )

  router.post(
    "/:bookingId/handover",
    asyncHandler(bookingController.completeHandover)
  )

  router.post(
    "/:bookingId/start-service",
    asyncHandler(bookingController.startService)
  )

  router.post(
    "/:bookingId/stall",
    asyncHandler(bookingController.stallBooking)
  )

  router.post(
    "/:bookingId/resolve-stalled",
    asyncHandler(bookingController.resolveStalled)
  )

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
