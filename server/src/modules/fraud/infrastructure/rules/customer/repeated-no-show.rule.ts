import { IFraudRule, FraudEvaluationContext } from "../../../domain/services/fraud-rule.interface";
import { FraudSignal, ActorType, EntityType } from "../../../domain/value-objects/fraud-types.vo";
import { IFraudCacheService } from "../../../domain/services/fraud-cache.interface";

export class RepeatedNoShowRule implements IFraudRule {
  readonly code = "CUST_REPEATED_NO_SHOW";
  readonly description = "Customer has accumulated repeated no-show records";
  readonly baseScore = 40;

  constructor(
    private readonly cacheService: IFraudCacheService,
    private readonly threshold: number = 3
  ) {}

  isApplicable(context: FraudEvaluationContext): boolean {
    return (
      context.actorType === ActorType.CUSTOMER &&
      context.entityType === EntityType.BOOKING &&
      context.eventType === "BOOKING_NO_SHOW"
    );
  }

  async evaluate(context: FraudEvaluationContext): Promise<FraudSignal | null> {
    const key = `fraud:counter:noshows:user:${context.userId}`;
    const count = await this.cacheService.incrementWithTtl(key, 1209600);

    if (count >= this.threshold) {
      return {
        code: this.code,
        description: `Customer accumulated ${count} no-shows within 14 days`,
        score: this.baseScore + (count - this.threshold) * 5,
        metadata: {
          noShowCount: count,
          periodDays: 14,
          threshold: this.threshold,
        },
      };
    }

    return null;
  }
}
