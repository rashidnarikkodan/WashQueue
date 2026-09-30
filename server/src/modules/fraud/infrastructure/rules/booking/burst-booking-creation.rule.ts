import { IFraudRule, FraudEvaluationContext } from "../../../domain/services/fraud-rule.interface";
import { FraudSignal, EntityType } from "../../../domain/value-objects/fraud-types.vo";
import { IFraudCacheService } from "../../../domain/services/fraud-cache.interface";

export class BurstBookingCreationRule implements IFraudRule {
  readonly code = "BOOKING_BURST_CREATION";
  readonly description = "Rapid automated booking creation detected in seconds window";
  readonly baseScore = 45;

  constructor(
    private readonly cacheService: IFraudCacheService,
    private readonly threshold: number = 3,
    private readonly windowSeconds: number = 30
  ) {}

  isApplicable(context: FraudEvaluationContext): boolean {
    return (
      context.entityType === EntityType.BOOKING &&
      (context.eventType === "BOOKING_CREATED" || context.eventType === "BOOKING_CREATION_ATTEMPT")
    );
  }

  async evaluate(context: FraudEvaluationContext): Promise<FraudSignal | null> {
    const key = `fraud:window:burst:user:${context.userId}`;
    const count = await this.cacheService.recordTimestampInWindow(
      key,
      context.timestamp.getTime(),
      this.windowSeconds
    );

    if (count >= this.threshold) {
      return {
        code: this.code,
        description: `High burst booking volume: ${count} bookings within ${this.windowSeconds} seconds`,
        score: this.baseScore,
        metadata: {
          count,
          windowSeconds: this.windowSeconds,
        },
      };
    }

    return null;
  }
}
