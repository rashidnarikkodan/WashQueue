import { FraudEvent } from "../entities/fraud-event.entity";
import { RiskLevel, FraudEventStatus } from "../value-objects/fraud-types.vo";
import { IBaseRepository } from "@/core/domain/repository.interface";

export interface FraudEventFilterOptions {
  userId?: string;
  status?: FraudEventStatus;
  riskLevel?: RiskLevel;
  actorType?: string;
  entityType?: string;
  stationId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UserFraudProfileSummary {
  userId: string;
  totalEvents: number;
  highRiskCount: number;
  mediumRiskCount: number;
  openEventsCount: number;
  lastEventDate?: Date | null;
  highestRiskScore: number;
}

export interface FraudDashboardMetrics {
  totalAlerts: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  openAlertsCount: number;
  highRiskUsersCount: number;
  suspendedAccountsCount: number;
  failedLoginsCount: number;
  criticalThreatsCount: number;
  alertsTrend: string;
  highRiskTrend: string;
  loginsTrend: string;
}

export interface WatchlistUserItem {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "Customer" | "Owner" | "Manager" | "Admin";
  riskScore: number;
  cancellationRate: number;
  primarySignal: string;
  duplicateSignalStatus: "No Match" | "YES (HIGH)" | "SUSPICIOUS";
  status: "ACTIVE" | "FLAGGED" | "UNDER REVIEW" | "SUSPENDED";
  lastActive: string;
}

export interface SecurityLogItem {
  id: string;
  type: "LOGIN_FAILED" | "UNUSUAL_GEO" | "KEY_ROTATED" | "DEVICE_FLAGGED" | "STATUS_FLAPPED" | "BURST_ATTEMPT";
  title: string;
  ip?: string;
  meta: string;
  description: string;
  timestamp: string;
  severity: RiskLevel;
}

export interface IFraudEventRepository extends IBaseRepository<FraudEvent> {
  findWithFilters(filters: FraudEventFilterOptions): Promise<{ items: FraudEvent[]; total: number }>;
  findByUserId(userId: string, limit?: number): Promise<FraudEvent[]>;
  getUserFraudSummary(userId: string): Promise<UserFraudProfileSummary>;
  getDashboardMetrics(startDate?: Date, endDate?: Date): Promise<FraudDashboardMetrics>;
  getWatchlist(): Promise<WatchlistUserItem[]>;
  getSecurityLogs(): Promise<SecurityLogItem[]>;
}
