import { IFraudRule, FraudEvaluationContext } from "../../../domain/services/fraud-rule.interface"
import { FraudSignal, ActorType, EntityType } from "../../../domain/value-objects/fraud-types.vo"
import { IFraudCacheService } from "../../../domain/services/fraud-cache.interface"

export class SuspiciousManagerCancellationRule implements IFraudRule {
  readonly code = "OPS_SUSPICIOUS_MANUAL_CANCEL"
  readonly description = "Manager or Owner cancelled multiple bookings within a short period"
  readonly baseScore = 40

  constructor(
    private readonly cacheService: IFraudCacheService,
    private readonly threshold: number = 5
  ) {}

  isApplicable(context: FraudEvaluationContext): boolean {
    return (
      (context.actorType === ActorType.MANAGER || context.actorType === ActorType.OWNER) &&
      context.entityType === EntityType.BOOKING &&
      context.eventType === "BOOKING_CANCELLED"
    )
  }

  async evaluate(context: FraudEvaluationContext): Promise<FraudSignal | null> {
    const key = `fraud:counter:ops_cancel:user:${context.userId}`
    const count = await this.cacheService.incrementWithTtl(key, 7200)

    if (count >= this.threshold) {
      return {
        code: this.code,
        description: `Operational actor cancelled ${count} bookings within 2 hours`,
        score: this.baseScore + (count - this.threshold) * 5,
        metadata: {
          cancellationCount: count,
          periodHours: 2,
          threshold: this.threshold,
        },
      }
    }

    return null
  }
}
