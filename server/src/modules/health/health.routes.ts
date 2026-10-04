import { Router } from "express"
import asyncHandler from "@/common/utils/async-handler"
import { HealthController } from "./health.controller"

export const createHealthRoutes = (controller: HealthController): Router => {
  const router = Router()

  router.get("/", asyncHandler(controller.getReport))
  router.get("/live", asyncHandler(controller.getLive))
  router.get("/ready", asyncHandler(controller.getReady))
  router.get("/metrics", asyncHandler(controller.getMetrics))

  return router
}
