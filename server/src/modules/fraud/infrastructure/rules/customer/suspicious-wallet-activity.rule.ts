import { IFraudRule, FraudEvaluationContext } from "../../../domain/services/fraud-rule.interface"
import { FraudSignal, ActorType, EntityType } from "../../../domain/value-objects/fraud-types.vo"
import { IFraudCacheService } from "../../../domain/services/fraud-cache.interface"

export class SuspiciousWalletActivityRule implements IFraudRule {
  readonly code = "CUST_SUSPICIOUS_WALLET_ACTIVITY"
  readonly description = "Customer exhibits rapid top-up and refund or withdrawal attempts"
  readonly baseScore = 35

  constructor(
    private readonly cacheService: IFraudCacheService,
    private readonly threshold: number = 3
  ) {}

  isApplicable(context: FraudEvaluationContext): boolean {
    return (
      context.actorType === ActorType.CUSTOMER &&
      context.entityType === EntityType.WALLET &&
      (context.eventType === "WALLET_REFUND_REQUESTED" || context.eventType === "WALLET_DEBIT")
    )
  }

  async evaluate(context: FraudEvaluationContext): Promise<FraudSignal | null> {
    const key = `fraud:counter:wallet_drain:user:${context.userId}`
    const count = await this.cacheService.incrementWithTtl(key, 3600)

    if (count >= this.threshold) {
      return {
        code: this.code,
        description: `Customer triggered ${count} wallet refund/reversal actions within 1 hour`,
        score: this.baseScore,
        metadata: {
          actionCount: count,
          periodMinutes: 60,
          threshold: this.threshold,
        },
      }
    }

    return null
  }
}
