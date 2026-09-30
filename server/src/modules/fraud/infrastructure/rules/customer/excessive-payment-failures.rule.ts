import { IFraudRule, FraudEvaluationContext } from "../../../domain/services/fraud-rule.interface";
import { FraudSignal, ActorType, EntityType } from "../../../domain/value-objects/fraud-types.vo";
import { IFraudCacheService } from "../../../domain/services/fraud-cache.interface";

export class ExcessivePaymentFailuresRule implements IFraudRule {
  readonly code = "CUST_EXCESSIVE_PAYMENT_FAILURES";
  readonly description = "Customer has multiple failed payment attempts within a short interval";
  readonly baseScore = 35;

  constructor(
    private readonly cacheService: IFraudCacheService,
    private readonly threshold: number = 3
  ) {}

  isApplicable(context: FraudEvaluationContext): boolean {
    return (
      context.actorType === ActorType.CUSTOMER &&
      context.entityType === EntityType.PAYMENT &&
      context.eventType === "PAYMENT_FAILED"
    );
  }

  async evaluate(context: FraudEvaluationContext): Promise<FraudSignal | null> {
    const key = `fraud:counter:payment_failures:user:${context.userId}`;
    const count = await this.cacheService.incrementWithTtl(key, 900);

    if (count >= this.threshold) {
      return {
        code: this.code,
        description: `Customer encountered ${count} failed payment attempts within 15 minutes`,
        score: this.baseScore + Math.min(15, (count - this.threshold) * 5),
        metadata: {
          failureCount: count,
          periodMinutes: 15,
          threshold: this.threshold,
        },
      };
    }

    return null;
  }
}
