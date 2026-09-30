import { IFraudRule, FraudEvaluationContext } from "../../../domain/services/fraud-rule.interface";
import { FraudSignal, ActorType, EntityType } from "../../../domain/value-objects/fraud-types.vo";
import { IFraudCacheService } from "../../../domain/services/fraud-cache.interface";

export class ExcessiveRefundIssuanceRule implements IFraudRule {
  readonly code = "OPS_EXCESSIVE_REFUNDS";
  readonly description = "Abnormally high volume of refunds issued for a station";
  readonly baseScore = 45;

  constructor(
    private readonly cacheService: IFraudCacheService,
    private readonly threshold: number = 8
  ) {}

  isApplicable(context: FraudEvaluationContext): boolean {
    return (
      (context.actorType === ActorType.MANAGER || context.actorType === ActorType.OWNER) &&
      context.entityType === EntityType.PAYMENT &&
      context.eventType === "PAYMENT_REFUNDED"
    );
  }

  async evaluate(context: FraudEvaluationContext): Promise<FraudSignal | null> {
    const stationId = context.stationId ?? context.payload?.stationId;
    if (!stationId) return null;

    const key = `fraud:counter:station_refunds:${stationId}`;
    const count = await this.cacheService.incrementWithTtl(key, 86400);

    if (count > this.threshold) {
      return {
        code: this.code,
        description: `Station exceeded refund limits with ${count} refunds in 24 hours`,
        score: this.baseScore,
        metadata: {
          stationId,
          refundCount: count,
          threshold: this.threshold,
        },
      };
    }

    return null;
  }
}
