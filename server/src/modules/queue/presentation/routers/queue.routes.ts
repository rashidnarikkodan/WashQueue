import { Router } from "express"
import { QueueController } from "../controllers/queue.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { authorize } from "@/infrastructure/http/middleware/authorize"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import { ROLE } from "@/common/constants/role.constants"
import { requireManagerPermission } from "@/modules/manager/manager.module"
import { ManagerPermission } from "@/modules/manager/domain/entities/ManagerAssignment"
import { bookingIdParamSchema } from "@/modules/booking/presentation/schema/booking.schema"
import {
  stationIdParamSchema,
  validateQrSchema,
  preInspectionSchema,
  postInspectionSchema,
  completeHandoverSchema,
  stallBookingSchema,
  resolveStalledSchema,
} from "../schema/queue.schema"

export const createQueueRouter = (queueController: QueueController): Router => {
  const router = Router()

  router.get(
    "/stations/:stationId/public-queue",
    validateRequest(stationIdParamSchema, "params"),
    asyncHandler(queueController.getPublicStationQueue)
  )

  router.use(authenticate)

  router.get(
    "/stations/:stationId/queue",
    authorize(ROLE.MANAGER, ROLE.OWNER, ROLE.ADMIN),
    validateRequest(stationIdParamSchema, "params"),
    requireManagerPermission(ManagerPermission.QUEUE_MANAGEMENT),
    asyncHandler(queueController.getOperationalQueue)
  )

  router.post(
    "/validate-qr",
    authorize(ROLE.MANAGER, ROLE.OWNER, ROLE.ADMIN),
    validateRequest(validateQrSchema),
    asyncHandler(queueController.validateQr)
  )

  router.post(
    "/:bookingId/pre-inspection",
    authorize(ROLE.MANAGER, ROLE.OWNER),
    validateRequest(bookingIdParamSchema, "params"),
    validateRequest(preInspectionSchema),
    asyncHandler(queueController.submitPreInspection)
  )

  router.post(
    "/:bookingId/start-service",
    authorize(ROLE.MANAGER, ROLE.OWNER, ROLE.ADMIN),
    validateRequest(bookingIdParamSchema, "params"),
    asyncHandler(queueController.startService)
  )

  router.post(
    "/:bookingId/post-inspection",
    authorize(ROLE.MANAGER, ROLE.OWNER, ROLE.ADMIN),
    validateRequest(bookingIdParamSchema, "params"),
    validateRequest(postInspectionSchema),
    asyncHandler(queueController.submitPostInspection)
  )

  router.post(
    "/:bookingId/handover",
    authorize(ROLE.MANAGER, ROLE.OWNER, ROLE.ADMIN),
    validateRequest(bookingIdParamSchema, "params"),
    validateRequest(completeHandoverSchema),
    asyncHandler(queueController.completeHandover)
  )

  router.post(
    "/:bookingId/stall",
    authorize(ROLE.MANAGER, ROLE.OWNER, ROLE.ADMIN),
    validateRequest(bookingIdParamSchema, "params"),
    validateRequest(stallBookingSchema),
    asyncHandler(queueController.stallBooking)
  )

  router.post(
    "/:bookingId/resolve-stalled",
    authorize(ROLE.MANAGER, ROLE.OWNER, ROLE.ADMIN),
    validateRequest(bookingIdParamSchema, "params"),
    validateRequest(resolveStalledSchema),
    asyncHandler(queueController.resolveStalled)
  )

  return router
}
