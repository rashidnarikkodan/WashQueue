import {
  EvaluateRiskInputDTO,
  FraudEventFilterDTO,
  UpdateFraudEventStatusInputDTO,
} from "../dtos/fraud.dto";
import { FraudEvent } from "../../domain/entities/fraud-event.entity";
import { RiskAssessment } from "../../domain/value-objects/fraud-types.vo";
import {
  FraudDashboardMetrics,
  UserFraudProfileSummary,
} from "../../domain/repositories/fraud-event.repository.interface";

export interface UserFraudProfileResult {
  summary: UserFraudProfileSummary;
  recentEvents: FraudEvent[];
}

export interface IEvaluateRiskUseCase {
  execute(dto: EvaluateRiskInputDTO): Promise<RiskAssessment>;
}

export interface IListFraudEventsUseCase {
  execute(filters: FraudEventFilterDTO): Promise<{ items: FraudEvent[]; total: number }>;
}

export interface IGetFraudEventUseCase {
  execute(id: string): Promise<FraudEvent>;
}

export interface IUpdateFraudEventStatusUseCase {
  execute(dto: UpdateFraudEventStatusInputDTO): Promise<FraudEvent>;
}

export interface IGetUserFraudProfileUseCase {
  execute(userId: string): Promise<UserFraudProfileResult>;
}

export interface IGetFraudMetricsUseCase {
  execute(startDate?: Date, endDate?: Date): Promise<FraudDashboardMetrics>;
}

export interface IGetFraudWatchlistUseCase {
  execute(): Promise<any[]>;
}

export interface IGetFraudSecurityLogsUseCase {
  execute(): Promise<any[]>;
}
