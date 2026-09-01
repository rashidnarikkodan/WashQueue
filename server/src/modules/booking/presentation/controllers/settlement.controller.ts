import { Response } from "express"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import success from "@/common/utils/success"
import {
  IGetAdminSettlementMetricsUseCase,
  IGetAdminSettlementsUseCase,
  IGetOwnerEarningsHistoryUseCase,
  IGetOwnerSettlementSummaryUseCase,
  IGetOwnerSettlementsUseCase,
  IGetSettlementByIdUseCase,
  IManageSettlementHoldUseCase,
  IRetrySettlementUseCase,
} from "../../application/interfaces/settlement.usecases"
import { SettlementStatus } from "../../domain/entities/Settlement"

export class SettlementController {
  constructor(
    private readonly getOwnerSettlementSummaryUseCase: IGetOwnerSettlementSummaryUseCase,
    private readonly getOwnerSettlementsUseCase: IGetOwnerSettlementsUseCase,
    private readonly getOwnerEarningsHistoryUseCase: IGetOwnerEarningsHistoryUseCase,
    private readonly getAdminSettlementsUseCase: IGetAdminSettlementsUseCase,
    private readonly getAdminSettlementMetricsUseCase: IGetAdminSettlementMetricsUseCase,
    private readonly getSettlementByIdUseCase: IGetSettlementByIdUseCase,
    private readonly retrySettlementUseCase: IRetrySettlementUseCase,
    private readonly manageSettlementHoldUseCase: IManageSettlementHoldUseCase
  ) {}

  // Provider: Earnings Summary
  getOwnerSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string }
    const parsedStart = startDate ? new Date(startDate) : undefined
    const parsedEnd = endDate ? new Date(endDate) : undefined

    const summary = await this.getOwnerSettlementSummaryUseCase.execute(
      userId,
      parsedStart,
      parsedEnd
    )
    success(res, summary, HTTP_STATUS.OK, "Owner settlement summary retrieved successfully")
  }

  // Provider: Settlement History
  getOwnerSettlements = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const {
      status,
      stationId,
      startDate,
      endDate,
      search,
      page = "1",
      limit = "10",
    } = req.query as Record<string, string | undefined>

    const parsedStatus = status ? (status as SettlementStatus) : undefined
    const parsedStart = startDate ? new Date(startDate) : undefined
    const parsedEnd = endDate ? new Date(endDate) : undefined

    const result = await this.getOwnerSettlementsUseCase.execute(userId, {
      status: parsedStatus,
      stationId,
      startDate: parsedStart,
      endDate: parsedEnd,
      search,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
    })

    success(res, result, HTTP_STATUS.OK, "Owner settlements retrieved successfully")
  }

  // Provider: Earnings History (completed bookings)
  getOwnerEarnings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { page = "1", limit = "10" } = req.query as Record<string, string | undefined>

    const result = await this.getOwnerEarningsHistoryUseCase.execute(
      userId,
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 10
    )

    success(res, result, HTTP_STATUS.OK, "Owner earnings history retrieved successfully")
  }

  // Provider & Admin: Settlement Detail
  getSettlementById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId
    const role = req.user?.role
    if (!userId || !role) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { id } = req.params as { id: string }
    const result = await this.getSettlementByIdUseCase.execute(id, userId, role)

    success(res, result, HTTP_STATUS.OK, "Settlement details retrieved successfully")
  }

  // Admin: Global Settlements List
  getAdminSettlements = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const {
      status,
      ownerId,
      stationId,
      startDate,
      endDate,
      search,
      page = "1",
      limit = "10",
    } = req.query as Record<string, string | undefined>

    const parsedStatus = status ? (status as SettlementStatus) : undefined
    const parsedStart = startDate ? new Date(startDate) : undefined
    const parsedEnd = endDate ? new Date(endDate) : undefined

    const result = await this.getAdminSettlementsUseCase.execute({
      status: parsedStatus,
      ownerId,
      stationId,
      startDate: parsedStart,
      endDate: parsedEnd,
      search,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
    })

    success(res, result, HTTP_STATUS.OK, "Admin settlements retrieved successfully")
  }

  // Admin: Financial Metrics
  getAdminMetrics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string }
    const parsedStart = startDate ? new Date(startDate) : undefined
    const parsedEnd = endDate ? new Date(endDate) : undefined

    const metrics = await this.getAdminSettlementMetricsUseCase.execute(
      parsedStart,
      parsedEnd
    )
    success(res, metrics, HTTP_STATUS.OK, "Admin settlement metrics retrieved successfully")
  }

  // Admin: Retry Settlement
  retrySettlement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params as { id: string }
    const settlement = await this.retrySettlementUseCase.execute(id)

    success(
      res,
      settlement.getProps(),
      HTTP_STATUS.OK,
      `Settlement retry executed; status is now ${settlement.status}`
    )
  }

  // Admin: Hold Settlement
  holdSettlement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params as { id: string }
    const { reason = "Manual admin hold" } = req.body as { reason?: string }

    const settlement = await this.manageSettlementHoldUseCase.hold(id, reason)
    success(res, settlement.getProps(), HTTP_STATUS.OK, "Settlement placed on hold")
  }

  // Admin: Release Settlement
  releaseSettlement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params as { id: string }
    const settlement = await this.manageSettlementHoldUseCase.release(id)

    success(res, settlement.getProps(), HTTP_STATUS.OK, "Settlement hold released")
  }
}
