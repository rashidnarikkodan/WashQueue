import { ActorType, EntityType, FraudSignal } from "../value-objects/fraud-types.vo"

export interface FraudEvaluationContext {
  userId: string
  actorType: ActorType
  entityType: EntityType
  entityId: string
  eventType: string
  stationId?: string
  ipAddress?: string
  deviceId?: string
  payload?: Record<string, unknown>
  timestamp: Date
}

export interface IFraudRule {
  readonly code: string
  readonly description: string
  readonly baseScore: number
  isApplicable(context: FraudEvaluationContext): boolean
  evaluate(context: FraudEvaluationContext): Promise<FraudSignal | null>
}
