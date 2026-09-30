import {
  RiskLevel,
  ActorType,
  EntityType,
  FraudEventStatus,
  FraudSignal,
} from "../../domain/value-objects/fraud-types.vo"

export interface EvaluateRiskInputDTO {
  userId: string
  actorType: ActorType
  entityType: EntityType
  entityId: string
  eventType: string
  stationId?: string
  ipAddress?: string
  deviceId?: string
  payload?: Record<string, unknown>
}

export interface FraudEventFilterDTO {
  userId?: string
  status?: FraudEventStatus
  riskLevel?: RiskLevel
  actorType?: string
  entityType?: string
  stationId?: string
  startDate?: Date
  endDate?: Date
  search?: string
  page?: number
  limit?: number
}

export interface UpdateFraudEventStatusInputDTO {
  eventId: string
  adminId: string
  action: "REVIEW" | "RESOLVE" | "DISMISS"
  notes?: string
}

export interface FraudEventResponseDTO {
  id?: string
  userId: string
  actorType: string
  entityType: string
  entityId: string
  eventType: string
  riskScore: number
  riskLevel: string
  signals: FraudSignal[]
  reason: string
  status: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
  resolvedAt?: string | null
  resolvedBy?: string | null
  resolutionNotes?: string | null
}

export interface FraudMetricsResponseDTO {
  totalAlerts: number
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
  openAlertsCount: number
  highRiskUsersCount: number
  suspendedAccountsCount: number
  failedLoginsCount: number
  criticalThreatsCount: number
  alertsTrend: string
  highRiskTrend: string
  loginsTrend: string
}

export interface UserFraudProfileResponseDTO {
  summary: {
    userId: string
    totalEvents: number
    highRiskCount: number
    mediumRiskCount: number
    openEventsCount: number
    lastEventDate?: Date | null
    highestRiskScore: number
  }
  recentEvents: FraudEventResponseDTO[]
}
