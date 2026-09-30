export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type ActorType = "CUSTOMER" | "OWNER" | "MANAGER" | "ADMIN" | "SYSTEM";
export type EntityType = "BOOKING" | "PAYMENT" | "WALLET" | "STATION" | "REVIEW" | "USER";
export type FraudEventStatus = "OPEN" | "REVIEWING" | "RESOLVED" | "DISMISSED";

export interface FraudSignal {
  code: string;
  description: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface FraudEventDto {
  id?: string;
  _id?: string;
  userId: string;
  actorType: ActorType;
  entityType: EntityType;
  entityId: string;
  eventType: string;
  riskScore: number;
  riskLevel: RiskLevel;
  signals: FraudSignal[];
  reason: string;
  status: FraudEventStatus;
  metadata?: {
    stationId?: string;
    ipAddress?: string;
    deviceId?: string;
    userName?: string;
    userEmail?: string;
    userAvatar?: string;
    [key: string]: unknown;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  resolutionNotes?: string | null;
}

export interface FraudQueryParams {
  userId?: string;
  status?: FraudEventStatus | "ALL";
  riskLevel?: RiskLevel | "ALL";
  actorType?: string;
  entityType?: string;
  stationId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface FraudListResponse {
  items: FraudEventDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FraudMetricsDto {
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

export interface WatchlistUser {
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

export interface SecurityAuditLog {
  id: string;
  type: "LOGIN_FAILED" | "UNUSUAL_GEO" | "KEY_ROTATED" | "DEVICE_FLAGGED" | "STATUS_FLAPPED" | "BURST_ATTEMPT";
  title: string;
  ip?: string;
  meta: string;
  description: string;
  timestamp: string;
  severity: RiskLevel;
}
