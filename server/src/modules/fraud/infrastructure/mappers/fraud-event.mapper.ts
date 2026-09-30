import { IMapper } from "@/core/domain/repository.interface"
import { FraudEvent, FraudEventProps } from "../../domain/entities/fraud-event.entity"
import { IFraudEventDoc } from "../model/fraud-event.mongo-schema"

export class FraudEventMapper implements IMapper<FraudEvent, IFraudEventDoc> {
  toDomain(raw: IFraudEventDoc): FraudEvent {
    return new FraudEvent({
      id: raw._id ? raw._id.toString() : undefined,
      userId: raw.userId,
      actorType: raw.actorType,
      entityType: raw.entityType,
      entityId: raw.entityId,
      eventType: raw.eventType,
      riskScore: raw.riskScore,
      riskLevel: raw.riskLevel,
      signals: raw.signals ? [...raw.signals] : [],
      reason: raw.reason,
      status: raw.status,
      metadata: raw.metadata,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      resolvedAt: raw.resolvedAt,
      resolvedBy: raw.resolvedBy,
      resolutionNotes: raw.resolutionNotes,
    })
  }

  toPersistence(entity: Partial<FraudEvent>): Partial<IFraudEventDoc> {
    const isEntity = entity instanceof FraudEvent
    const json = isEntity ? entity.toJSON() : (entity as Partial<FraudEventProps>)

    const persist: Record<string, unknown> = {}

    if (json.userId) persist.userId = json.userId
    if (json.actorType) persist.actorType = json.actorType
    if (json.entityType) persist.entityType = json.entityType
    if (json.entityId) persist.entityId = json.entityId
    if (json.eventType) persist.eventType = json.eventType
    if (typeof json.riskScore === "number") persist.riskScore = json.riskScore
    if (json.riskLevel) persist.riskLevel = json.riskLevel
    if (json.signals) persist.signals = json.signals
    if (json.reason) persist.reason = json.reason
    if (json.status) persist.status = json.status
    if (json.metadata) persist.metadata = json.metadata
    if (json.resolvedAt !== undefined) persist.resolvedAt = json.resolvedAt
    if (json.resolvedBy !== undefined) persist.resolvedBy = json.resolvedBy
    if (json.resolutionNotes !== undefined) persist.resolutionNotes = json.resolutionNotes
    if (json.createdAt) persist.createdAt = json.createdAt
    if (json.updatedAt) persist.updatedAt = json.updatedAt

    return persist as Partial<IFraudEventDoc>
  }
}
