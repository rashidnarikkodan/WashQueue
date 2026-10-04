import { Response } from "express"
import { DateRange } from "../domain/types/analytics.types"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import {
  IGetAdminDashboardUseCase,
  IGetManagerDashboardUseCase,
  IGetOwnerDashboardUseCase,
} from "../application/interfaces/analytics-usecases.interface"
import { IExportOwnerAnalyticsUseCase } from "../application/use-cases/export-owner-analytics.use-case"
import success from "@/common/utils/success"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"

export class AnalyticsController {
  constructor(
    private readonly getAdminDashboardUseCase: IGetAdminDashboardUseCase,
    private readonly getOwnerDashboardUseCase: IGetOwnerDashboardUseCase,
    private readonly getManagerDashboardUseCase: IGetManagerDashboardUseCase,
    private readonly exportOwnerAnalyticsUseCase: IExportOwnerAnalyticsUseCase
  ) {}

  getAdminDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const range = (req.query.range as DateRange) || "30_DAYS"
    const year = req.query.year ? Number(req.query.year) : undefined
    const month = req.query.month ? Number(req.query.month) : undefined
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined
    const data = await this.getAdminDashboardUseCase.execute(range, year, month, startDate, endDate)
    success(res, data, HTTP_STATUS.OK, "Admin dashboard fetched successfully")
  }

  getOwnerDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const ownerId = req.user?.userId
    if (!ownerId) {
      throw new UnauthorizedError()
    }
    const range = (req.query.range as DateRange) || "30_DAYS"
    const stationId = req.query.stationId as string | undefined
    const year = req.query.year ? Number(req.query.year) : undefined
    const month = req.query.month ? Number(req.query.month) : undefined
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined
    const data = await this.getOwnerDashboardUseCase.execute(
      ownerId,
      range,
      stationId,
      year,
      month,
      startDate,
      endDate
    )
    success(res, data, HTTP_STATUS.OK, "Owner dashboard fetched successfully")
  }

  getManagerDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError()
    }
    const stationId = req.query.stationId as string | undefined
    const range = (req.query.range as DateRange) || "TODAY"
    const year = req.query.year ? Number(req.query.year) : undefined
    const month = req.query.month ? Number(req.query.month) : undefined
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined
    const data = await this.getManagerDashboardUseCase.execute(
      userId,
      stationId,
      range,
      year,
      month,
      startDate,
      endDate
    )
    success(res, data, HTTP_STATUS.OK, "Manager dashboard fetched successfully")
  }

  exportOwnerAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const ownerId = req.user?.userId
    if (!ownerId) {
      throw new UnauthorizedError()
    }
    const range = (req.query.range as DateRange) || "30_DAYS"
    const stationId = req.query.stationId as string | undefined
    const year = req.query.year ? Number(req.query.year) : undefined
    const month = req.query.month ? Number(req.query.month) : undefined
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined

    const { buffer, contentType, filename } = await this.exportOwnerAnalyticsUseCase.execute(
      ownerId,
      range,
      stationId,
      year,
      month,
      startDate,
      endDate
    )

    res.setHeader("Content-Type", contentType)
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    res.send(buffer)
  }
}
