import { Router } from "express"
import { BookingController } from "../controllers/booking.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import {
  cancelBookingSchema,
  rescheduleBookingSchema,
  createBookingSchema,
  createWalkInBookingSchema,
  getBookingListQuerySchema,
  bookingIdParamSchema,
  getOwnerBookingListQuerySchema,
} from "../schema/booking.schema"
import { ROLE } from "@/common/constants/role.constants"
import { authorize } from "@/infrastructure/http/middleware/authorize"

export const createBookingRouter = (bookingController: BookingController): Router => {
  const router = Router()

  router.use(authenticate)

  router.post("/", validateRequest(createBookingSchema), asyncHandler(bookingController.create))
  router.get(
    "/",
    validateRequest(getBookingListQuerySchema, "query"),
    asyncHandler(bookingController.getUserBookings)
  )
  router.get(
    "/owners/:ownerId",
    validateRequest(getOwnerBookingListQuerySchema, "query"),
    asyncHandler(bookingController.getOwnerBooking)
  )
  router.get(
    "/:bookingId",
    validateRequest(bookingIdParamSchema, "params"),
    asyncHandler(bookingController.getById)
  )
  router.patch(
    "/:bookingId/cancel",
    validateRequest(bookingIdParamSchema, "params"),
    validateRequest(cancelBookingSchema),
    asyncHandler(bookingController.cancel)
  )
  router.patch(
    "/:bookingId/reschedule",
    validateRequest(bookingIdParamSchema, "params"),
    validateRequest(rescheduleBookingSchema),
    asyncHandler(bookingController.reschedule)
  )

  router.post(
    "/walk-in",
    authorize(ROLE.MANAGER, ROLE.OWNER, ROLE.ADMIN),
    validateRequest(createWalkInBookingSchema),
    asyncHandler(bookingController.createWalkIn)
  )

  return router
}
