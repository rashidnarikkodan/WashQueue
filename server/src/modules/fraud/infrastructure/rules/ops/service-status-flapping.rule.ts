import { IFraudRule, FraudEvaluationContext } from "../../../domain/services/fraud-rule.interface";
import { FraudSignal, ActorType, EntityType } from "../../../domain/value-objects/fraud-types.vo";
import { IFraudCacheService } from "../../../domain/services/fraud-cache.interface";

export class ServiceStatusFlappingRule implements IFraudRule {
  readonly code = "OPS_STATUS_FLAPPING";
  readonly description = "Rapid repetitive manipulation of booking or station service status";
  readonly baseScore = 30;

  constructor(
    private readonly cacheService: IFraudCacheService,
    private readonly threshold: number = 4
  ) {}

  isApplicable(context: FraudEvaluationContext): boolean {
    return (
      (context.actorType === ActorType.MANAGER || context.actorType === ActorType.OWNER) &&
      context.entityType === EntityType.BOOKING &&
      context.eventType === "QUEUE_STATUS_UPDATED"
    );
  }

  async evaluate(context: FraudEvaluationContext): Promise<FraudSignal | null> {
    const key = `fraud:counter:flapping:booking:${context.entityId}`;
    const count = await this.cacheService.incrementWithTtl(key, 1800);

    if (count > this.threshold) {
      return {
        code: this.code,
        description: `Booking status changed ${count} times within 30 minutes`,
        score: this.baseScore,
        metadata: {
          transitionCount: count,
          bookingId: context.entityId,
          threshold: this.threshold,
        },
      };
    }

    return null;
  }
}
