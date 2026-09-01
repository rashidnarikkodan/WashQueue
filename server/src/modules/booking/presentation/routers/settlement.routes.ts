import { Router } from "express"
import { SettlementController } from "../controllers/settlement.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { authorize } from "@/infrastructure/http/middleware/authorize"
import { ROLE } from "@/common/constants/role.constants"

export const createSettlementRouter = (settlementController: SettlementController): Router => {
  const router = Router()

  router.use(authenticate)

  // Provider routes
  router.get(
    "/owner/summary",
    authorize(ROLE.OWNER, ROLE.ADMIN),
    asyncHandler(settlementController.getOwnerSummary)
  )
  router.get(
    "/owner/earnings",
    authorize(ROLE.OWNER, ROLE.ADMIN),
    asyncHandler(settlementController.getOwnerEarnings)
  )
  router.get(
    "/owner",
    authorize(ROLE.OWNER, ROLE.ADMIN),
    asyncHandler(settlementController.getOwnerSettlements)
  )
  router.get(
    "/owner/:id",
    authorize(ROLE.OWNER, ROLE.ADMIN),
    asyncHandler(settlementController.getSettlementById)
  )

  // Admin routes
  router.get(
    "/admin",
    authorize(ROLE.ADMIN),
    asyncHandler(settlementController.getAdminSettlements)
  )
  router.get(
    "/admin/metrics",
    authorize(ROLE.ADMIN),
    asyncHandler(settlementController.getAdminMetrics)
  )
  router.get(
    "/admin/:id",
    authorize(ROLE.ADMIN),
    asyncHandler(settlementController.getSettlementById)
  )
  router.post(
    "/admin/:id/retry",
    authorize(ROLE.ADMIN),
    asyncHandler(settlementController.retrySettlement)
  )
  router.post(
    "/admin/:id/hold",
    authorize(ROLE.ADMIN),
    asyncHandler(settlementController.holdSettlement)
  )
  router.post(
    "/admin/:id/release",
    authorize(ROLE.ADMIN),
    asyncHandler(settlementController.releaseSettlement)
  )

  return router
}
