import { IFraudRule, FraudEvaluationContext } from "../../../domain/services/fraud-rule.interface";
import { FraudSignal, ActorType, EntityType } from "../../../domain/value-objects/fraud-types.vo";
import { IFraudCacheService } from "../../../domain/services/fraud-cache.interface";

export class ExcessiveCancellationsRule implements IFraudRule {
  readonly code = "CUST_EXCESSIVE_CANCELLATIONS";
  readonly description = "Customer has repeated booking cancellations within 24 hours";
  readonly baseScore = 30;

  constructor(
    private readonly cacheService: IFraudCacheService,
    private readonly threshold: number = 4
  ) {}

  isApplicable(context: FraudEvaluationContext): boolean {
    return (
      context.actorType === ActorType.CUSTOMER &&
      context.entityType === EntityType.BOOKING &&
      context.eventType === "BOOKING_CANCELLED"
    );
  }

  async evaluate(context: FraudEvaluationContext): Promise<FraudSignal | null> {
    const key = `fraud:counter:cancellations:user:${context.userId}`;
    const count = await this.cacheService.incrementWithTtl(key, 86400);

    if (count >= this.threshold) {
      const additional = Math.min(20, (count - this.threshold) * 5);
      return {
        code: this.code,
        description: `Customer cancelled ${count} bookings within 24 hours`,
        score: this.baseScore + additional,
        metadata: {
          cancellationCount: count,
          periodHours: 24,
          threshold: this.threshold,
        },
      };
    }

    return null;
  }
}
