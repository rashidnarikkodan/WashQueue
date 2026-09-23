import { Response } from "express"
import { GetAdminDashboardUseCase } from "../../application/use-cases/get-admin-dashboard.use-case"
import { GetOwnerDashboardUseCase } from "../../application/use-cases/get-owner-dashboard.use-case"
import { GetManagerDashboardUseCase } from "../../application/use-cases/get-manager-dashboard.use-case"
import { DateRange } from "../../domain/types/analytics.types"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"

export class AnalyticsController {
  constructor(
    private readonly getAdminDashboardUseCase: GetAdminDashboardUseCase,
    private readonly getOwnerDashboardUseCase: GetOwnerDashboardUseCase,
    private readonly getManagerDashboardUseCase: GetManagerDashboardUseCase
  ) {}

  getAdminDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const range = (req.query.range as DateRange) || "30_DAYS"
      const data = await this.getAdminDashboardUseCase.execute(range)
      res.status(200).json({ success: true, data })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch admin dashboard"
      res.status(500).json({ success: false, message })
    }
  }

  getOwnerDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const ownerId = req.user?.userId
      if (!ownerId) {
        res.status(401).json({ success: false, message: "Unauthorized" })
        return
      }
      const range = (req.query.range as DateRange) || "30_DAYS"
      const data = await this.getOwnerDashboardUseCase.execute(ownerId, range)
      res.status(200).json({ success: true, data })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch owner dashboard"
      res.status(500).json({ success: false, message })
    }
  }

  getManagerDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" })
        return
      }
      const stationId = req.query.stationId as string | undefined
      const data = await this.getManagerDashboardUseCase.execute(userId, stationId)
      res.status(200).json({ success: true, data })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch manager dashboard"
      res.status(500).json({ success: false, message })
    }
  }
}
