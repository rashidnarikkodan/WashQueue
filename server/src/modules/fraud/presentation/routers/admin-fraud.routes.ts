import { Router } from "express"
import { AdminFraudController } from "../controllers/admin-fraud.controller"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { authorize } from "@/infrastructure/http/middleware/authorize"
import { ROLE } from "@/common/constants/role.constants"
import asyncHandler from "@/common/utils/async-handler"

export const createFraudRouter = (controller: AdminFraudController): Router => {
  const router = Router()

  router.use(authenticate)
  router.use(authorize(ROLE.ADMIN))

  router.get("/metrics", asyncHandler(controller.getMetrics))
  router.get("/watchlist", asyncHandler(controller.getWatchlist))
  router.get("/security-logs", asyncHandler(controller.getSecurityLogs))
  router.get("/events", asyncHandler(controller.listEvents))
  router.get("/events/:id", asyncHandler(controller.getEventById))
  router.patch("/events/:id/status", asyncHandler(controller.updateEventStatus))
  router.get("/users/:userId", asyncHandler(controller.getUserProfile))
  router.post("/evaluate", asyncHandler(controller.evaluateRisk))

  return router
}
