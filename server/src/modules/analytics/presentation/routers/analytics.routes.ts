import { Router } from "express"
import { AnalyticsController } from "../controllers/analytics.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { authorize } from "@/infrastructure/http/middleware/authorize"
import { ROLE } from "@/common/constants/role.constants"

export const createAnalyticsRouter = (analyticsController: AnalyticsController): Router => {
  const router = Router()

  router.use(authenticate)

  router.get("/admin", authorize(ROLE.ADMIN), asyncHandler(analyticsController.getAdminDashboard))

  router.get(
    "/owner",
    authorize(ROLE.OWNER, ROLE.ADMIN),
    asyncHandler(analyticsController.getOwnerDashboard)
  )

  router.get(
    "/manager",
    authorize(ROLE.MANAGER, ROLE.OWNER, ROLE.ADMIN),
    asyncHandler(analyticsController.getManagerDashboard)
  )

  return router
}
