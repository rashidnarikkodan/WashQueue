import { Response } from "express"
import { DateRange } from "../domain/types/analytics.types"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import {
  IGetAdminDashboardUseCase,
  IGetManagerDashboardUseCase,
  IGetOwnerDashboardUseCase,
} from "../application/interfaces/analytics-usecases.interface"
import success from "@/common/utils/success"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"

export class AnalyticsController {
  constructor(
    private readonly getAdminDashboardUseCase: IGetAdminDashboardUseCase,
    private readonly getOwnerDashboardUseCase: IGetOwnerDashboardUseCase,
    private readonly getManagerDashboardUseCase: IGetManagerDashboardUseCase
  ) {}

  getAdminDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const range = (req.query.range as DateRange) || "30_DAYS"
    const data = await this.getAdminDashboardUseCase.execute(range)
    success(res, data, HTTP_STATUS.OK, "Admin dashboard fetched successfully")
  }

  getOwnerDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const ownerId = req.user?.userId
    if (!ownerId) {
      throw new UnauthorizedError()
    }
    const range = (req.query.range as DateRange) || "30_DAYS"
    const stationId = req.query.stationId as string | undefined
    const data = await this.getOwnerDashboardUseCase.execute(ownerId, range, stationId)
    success(res, data, HTTP_STATUS.OK, "Owner dashboard fetched successfully")
  }

  getManagerDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError()
    }
    const stationId = req.query.stationId as string | undefined
    const data = await this.getManagerDashboardUseCase.execute(userId, stationId)
    success(res, data, HTTP_STATUS.OK, "Manager dashboard fetched successfully")
  }
}
