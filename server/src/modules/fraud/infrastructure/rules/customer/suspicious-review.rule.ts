import { IFraudRule, FraudEvaluationContext } from "../../../domain/services/fraud-rule.interface"
import { FraudSignal, ActorType, EntityType } from "../../../domain/value-objects/fraud-types.vo"
import { IFraudCacheService } from "../../../domain/services/fraud-cache.interface"

export class SuspiciousReviewRule implements IFraudRule {
  readonly code = "CUST_SUSPICIOUS_REVIEW"
  readonly description = "Customer has submitted rapid or repeated review ratings"
  readonly baseScore = 25

  constructor(
    private readonly cacheService: IFraudCacheService,
    private readonly threshold: number = 3
  ) {}

  isApplicable(context: FraudEvaluationContext): boolean {
    return (
      context.actorType === ActorType.CUSTOMER &&
      context.entityType === EntityType.REVIEW &&
      context.eventType === "REVIEW_SUBMITTED"
    )
  }

  async evaluate(context: FraudEvaluationContext): Promise<FraudSignal | null> {
    const key = `fraud:counter:reviews:user:${context.userId}`
    const count = await this.cacheService.incrementWithTtl(key, 86400)

    if (count > this.threshold) {
      return {
        code: this.code,
        description: `Customer submitted ${count} station reviews within 24 hours`,
        score: this.baseScore,
        metadata: {
          reviewCount: count,
          threshold: this.threshold,
        },
      }
    }

    return null
  }
}
