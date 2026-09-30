import { FraudEvent } from "../../domain/entities/fraud-event.entity"
import { RiskAssessment } from "../../domain/value-objects/fraud-types.vo"

export interface FraudEventDTO {
  id?: string
  userId: string
  actorType: string
  entityType: string
  entityId: string
  eventType: string
  riskScore: number
  riskLevel: string
  signals: Array<{
    code: string
    description: string
    score: number
    metadata?: Record<string, unknown>
  }>
  reason: string
  status: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
  resolvedAt?: string | null
  resolvedBy?: string | null
  resolutionNotes?: string | null
}

export class FraudDTOMapper {
  static toDTO(event: FraudEvent): FraudEventDTO {
    const json = event.toJSON()
    return {
      id: json.id,
      userId: json.userId,
      actorType: json.actorType,
      entityType: json.entityType,
      entityId: json.entityId,
      eventType: json.eventType,
      riskScore: json.riskScore,
      riskLevel: json.riskLevel,
      signals: json.signals,
      reason: json.reason,
      status: json.status,
      metadata: json.metadata,
      createdAt:
        json.createdAt instanceof Date ? json.createdAt.toISOString() : String(json.createdAt),
      updatedAt:
        json.updatedAt instanceof Date ? json.updatedAt.toISOString() : String(json.updatedAt),
      resolvedAt: json.resolvedAt
        ? json.resolvedAt instanceof Date
          ? json.resolvedAt.toISOString()
          : String(json.resolvedAt)
        : null,
      resolvedBy: json.resolvedBy ?? null,
      resolutionNotes: json.resolutionNotes ?? null,
    }
  }

  static toAssessmentDTO(assessment: RiskAssessment) {
    return {
      score: assessment.score,
      level: assessment.level,
      signals: assessment.signals,
      reason: assessment.reason,
    }
  }
}
