import { IFraudRule, FraudEvaluationContext } from "../../../domain/services/fraud-rule.interface"
import { FraudSignal, ActorType, EntityType } from "../../../domain/value-objects/fraud-types.vo"
import { IFraudCacheService } from "../../../domain/services/fraud-cache.interface"

export class ExcessiveWalkinCreationRule implements IFraudRule {
  readonly code = "OPS_EXCESSIVE_WALKINS"
  readonly description = "Abnormally high walk-in bookings logged within a short time window"
  readonly baseScore = 35

  constructor(
    private readonly cacheService: IFraudCacheService,
    private readonly threshold: number = 10
  ) {}

  isApplicable(context: FraudEvaluationContext): boolean {
    return (
      (context.actorType === ActorType.MANAGER || context.actorType === ActorType.OWNER) &&
      context.entityType === EntityType.BOOKING &&
      context.eventType === "WALKIN_BOOKING_CREATED"
    )
  }

  async evaluate(context: FraudEvaluationContext): Promise<FraudSignal | null> {
    const stationId = context.stationId ?? context.payload?.stationId
    if (!stationId) return null

    const key = `fraud:counter:walkins:station:${stationId}`
    const count = await this.cacheService.incrementWithTtl(key, 3600)

    if (count > this.threshold) {
      return {
        code: this.code,
        description: `High walk-in creation velocity: ${count} walk-ins logged in 1 hour`,
        score: this.baseScore,
        metadata: {
          walkinCount: count,
          stationId,
          periodMinutes: 60,
          threshold: this.threshold,
        },
      }
    }

    return null
  }
}
