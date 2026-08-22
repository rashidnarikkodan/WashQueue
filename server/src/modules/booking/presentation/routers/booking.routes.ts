import { Router } from "express"
import { BookingController } from "../controllers/booking.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { authorize } from "@/infrastructure/http/middleware/authorize"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import { ROLE } from "@/common/constants/role.constants"
import { requireManagerPermission } from "@/modules/manager/manager.module"
import { ManagerPermission } from "@/modules/manager/domain/entities/ManagerAssignment"
import {
  cancelBookingSchema,
  rescheduleBookingSchema,
  createBookingSchema,
  createWalkInBookingSchema,
  getBookingListQuerySchema,
  bookingIdParamSchema,
  stationIdParamSchema,
  validateQrSchema,
  preInspectionSchema,
  postInspectionSchema,
  completeHandoverSchema,
  stallBookingSchema,
  resolveStalledSchema,
  getOwnerBookingListQuerySchema,
} from "../schema/booking.schema"

export const createBookingRouter = (bookingController: BookingController): Router => {
  const router = Router()

  router.get(
    "/stations/:stationId/public-queue",
    validateRequest(stationIdParamSchema, "params"),
    asyncHandler(bookingController.getPublicStationQueue)
  )

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
  router.get(
    "/:bookingId/invoice",
    validateRequest(bookingIdParamSchema, "params"),
    asyncHandler(bookingController.downloadInvoice)
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

  router.get(
    "/stations/:stationId/queue",
    authorize(ROLE.MANAGER, ROLE.OWNER, ROLE.ADMIN),
    validateRequest(stationIdParamSchema, "params"),
    requireManagerPermission(ManagerPermission.QUEUE_MANAGEMENT),
    asyncHandler(bookingController.getOperationalQueue)
  )

  router.post(
    "/validate-qr",
    authorize(ROLE.MANAGER, ROLE.OWNER, ROLE.ADMIN),
    validateRequest(validateQrSchema),
    asyncHandler(bookingController.validateQr)
  )

  router.post(
    "/walk-in",
    authorize(ROLE.MANAGER, ROLE.OWNER, ROLE.ADMIN),
    validateRequest(createWalkInBookingSchema),
    asyncHandler(bookingController.createWalkIn)
  )

  router.post(
    "/:bookingId/pre-inspection",
    authorize(ROLE.MANAGER, ROLE.OWNER, ROLE.ADMIN),
    validateRequest(bookingIdParamSchema, "params"),
    validateRequest(preInspectionSchema),
    asyncHandler(bookingController.submitPreInspection)
  )

  router.post(
    "/:bookingId/start-service",
    authorize(ROLE.MANAGER, ROLE.OWNER, ROLE.ADMIN),
    validateRequest(bookingIdParamSchema, "params"),
    asyncHandler(bookingController.startService)
  )

  router.post(
    "/:bookingId/post-inspection",
    authorize(ROLE.MANAGER, ROLE.OWNER, ROLE.ADMIN),
    validateRequest(bookingIdParamSchema, "params"),
    validateRequest(postInspectionSchema),
    asyncHandler(bookingController.submitPostInspection)
  )

  router.post(
    "/:bookingId/handover",
    authorize(ROLE.MANAGER, ROLE.OWNER, ROLE.ADMIN),
    validateRequest(bookingIdParamSchema, "params"),
    validateRequest(completeHandoverSchema),
    asyncHandler(bookingController.completeHandover)
  )

  router.post(
    "/:bookingId/stall",
    authorize(ROLE.MANAGER, ROLE.OWNER, ROLE.ADMIN),
    validateRequest(bookingIdParamSchema, "params"),
    validateRequest(stallBookingSchema),
    asyncHandler(bookingController.stallBooking)
  )

  router.post(
    "/:bookingId/resolve-stalled",
    authorize(ROLE.MANAGER, ROLE.OWNER, ROLE.ADMIN),
    validateRequest(bookingIdParamSchema, "params"),
    validateRequest(resolveStalledSchema),
    asyncHandler(bookingController.resolveStalled)
  )

  return router
}
