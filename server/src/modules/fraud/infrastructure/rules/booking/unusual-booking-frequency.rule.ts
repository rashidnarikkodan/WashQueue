import { IFraudRule, FraudEvaluationContext } from "../../../domain/services/fraud-rule.interface";
import { FraudSignal, EntityType } from "../../../domain/value-objects/fraud-types.vo";
import { IFraudCacheService } from "../../../domain/services/fraud-cache.interface";

export class UnusualBookingFrequencyRule implements IFraudRule {
  readonly code = "BOOKING_UNUSUAL_FREQUENCY";
  readonly description = "Unusual overall booking frequency over a 24-hour cycle";
  readonly baseScore = 30;

  constructor(
    private readonly cacheService: IFraudCacheService,
    private readonly threshold: number = 8
  ) {}

  isApplicable(context: FraudEvaluationContext): boolean {
    return (
      context.entityType === EntityType.BOOKING &&
      context.eventType === "BOOKING_CREATED"
    );
  }

  async evaluate(context: FraudEvaluationContext): Promise<FraudSignal | null> {
    const key = `fraud:counter:daily_bookings:user:${context.userId}`;
    const count = await this.cacheService.incrementWithTtl(key, 86400);

    if (count > this.threshold) {
      return {
        code: this.code,
        description: `Unusual booking frequency of ${count} bookings within 24 hours`,
        score: this.baseScore,
        metadata: {
          dailyBookings: count,
          threshold: this.threshold,
        },
      };
    }

    return null;
  }
}
