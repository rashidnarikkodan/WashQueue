import { Response } from "express";
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate";
import { HTTP_STATUS } from "@/common/constants/http.constants";
import success from "@/common/utils/success";
import { UnauthorizedError } from "@/common/errors/unauthorized-error";
import {
  IEvaluateRiskUseCase,
  IListFraudEventsUseCase,
  IGetFraudEventUseCase,
  IUpdateFraudEventStatusUseCase,
  IGetUserFraudProfileUseCase,
  IGetFraudMetricsUseCase,
  IGetFraudWatchlistUseCase,
  IGetFraudSecurityLogsUseCase,
} from "../../application/interfaces/fraud-usecases.interface";
import { FraudDTOMapper } from "../../application/mappers/fraud-dto.mapper";
import { RiskLevel, FraudEventStatus } from "../../domain/value-objects/fraud-types.vo";

export class AdminFraudController {
  constructor(
    private readonly listFraudEventsUseCase: IListFraudEventsUseCase,
    private readonly getFraudEventUseCase: IGetFraudEventUseCase,
    private readonly updateFraudEventStatusUseCase: IUpdateFraudEventStatusUseCase,
    private readonly getUserFraudProfileUseCase: IGetUserFraudProfileUseCase,
    private readonly evaluateRiskUseCase: IEvaluateRiskUseCase,
    private readonly getFraudMetricsUseCase: IGetFraudMetricsUseCase,
    private readonly getFraudWatchlistUseCase: IGetFraudWatchlistUseCase,
    private readonly getFraudSecurityLogsUseCase: IGetFraudSecurityLogsUseCase
  ) {}

  getMetrics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { startDate, endDate } = req.query;
    const metrics = await this.getFraudMetricsUseCase.execute(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    success(res, metrics, HTTP_STATUS.OK, "Fraud metrics retrieved successfully");
  };

  listEvents = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const {
      userId,
      status,
      riskLevel,
      actorType,
      entityType,
      stationId,
      startDate,
      endDate,
      search,
      page,
      limit,
    } = req.query;

    const result = await this.listFraudEventsUseCase.execute({
      userId: userId as string | undefined,
      status: status as FraudEventStatus | undefined,
      riskLevel: riskLevel as RiskLevel | undefined,
      actorType: actorType as string | undefined,
      entityType: entityType as string | undefined,
      stationId: stationId as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      search: search as string | undefined,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
    });

    const responseData = {
      items: result.items.map((item) => FraudDTOMapper.toDTO(item)),
      total: result.total,
    };

    success(res, responseData, HTTP_STATUS.OK, "Fraud events retrieved successfully");
  };

  getEventById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const event = await this.getFraudEventUseCase.execute(id);
    success(res, FraudDTOMapper.toDTO(event), HTTP_STATUS.OK, "Fraud event retrieved successfully");
  };

  updateEventStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const adminId = req.user?.userId;
    if (!adminId) {
      throw new UnauthorizedError("Admin authentication required");
    }

    const id = String(req.params.id);
    const { action, notes } = req.body;

    const updatedEvent = await this.updateFraudEventStatusUseCase.execute({
      eventId: id,
      adminId,
      action,
      notes,
    });

    success(res, FraudDTOMapper.toDTO(updatedEvent), HTTP_STATUS.OK, "Fraud event status updated successfully");
  };

  getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = String(req.params.userId);
    const profile = await this.getUserFraudProfileUseCase.execute(userId);
    const responseData = {
      summary: profile.summary,
      recentEvents: profile.recentEvents.map((ev) => FraudDTOMapper.toDTO(ev)),
    };
    success(res, responseData, HTTP_STATUS.OK, "User fraud profile retrieved successfully");
  };

  getWatchlist = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    const watchlist = await this.getFraudWatchlistUseCase.execute();
    success(res, watchlist, HTTP_STATUS.OK, "Fraud watchlist retrieved successfully");
  };

  getSecurityLogs = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    const logs = await this.getFraudSecurityLogsUseCase.execute();
    success(res, logs, HTTP_STATUS.OK, "Security logs retrieved successfully");
  };

  evaluateRisk = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.evaluateRiskUseCase.execute(req.body);
    success(res, FraudDTOMapper.toAssessmentDTO(result), HTTP_STATUS.OK, "Risk evaluated successfully");
  };
}
