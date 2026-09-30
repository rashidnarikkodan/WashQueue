import { IFraudRule, FraudEvaluationContext } from "../../../domain/services/fraud-rule.interface"
import { FraudSignal, ActorType, EntityType } from "../../../domain/value-objects/fraud-types.vo"
import { IFraudCacheService } from "../../../domain/services/fraud-cache.interface"

export class RapidBookingRule implements IFraudRule {
  readonly code = "CUST_RAPID_BOOKING"
  readonly description = "Customer created abnormally high number of bookings in a short window"
  readonly baseScore = 35

  constructor(
    private readonly cacheService: IFraudCacheService,
    private readonly threshold: number = 5,
    private readonly windowSeconds: number = 600
  ) {}

  isApplicable(context: FraudEvaluationContext): boolean {
    return (
      context.actorType === ActorType.CUSTOMER &&
      context.entityType === EntityType.BOOKING &&
      (context.eventType === "BOOKING_CREATED" || context.eventType === "BOOKING_CREATION_ATTEMPT")
    )
  }

  async evaluate(context: FraudEvaluationContext): Promise<FraudSignal | null> {
    const key = `fraud:window:rapid_bookings:user:${context.userId}`
    const count = await this.cacheService.recordTimestampInWindow(
      key,
      context.timestamp.getTime(),
      this.windowSeconds
    )

    if (count > this.threshold) {
      return {
        code: this.code,
        description: `Customer attempted ${count} bookings within 10 minutes`,
        score: this.baseScore,
        metadata: {
          bookingCount: count,
          windowSeconds: this.windowSeconds,
          threshold: this.threshold,
        },
      }
    }

    return null
  }
}
