import { IFraudRule, FraudEvaluationContext } from "../../../domain/services/fraud-rule.interface"
import { FraudSignal, EntityType } from "../../../domain/value-objects/fraud-types.vo"
import { IFraudCacheService } from "../../../domain/services/fraud-cache.interface"

export class LoginVelocityAbuseRule implements IFraudRule {
  readonly code = "ACCT_LOGIN_VELOCITY"
  readonly description = "Excessive failed login attempts from user identifier or IP address"
  readonly baseScore = 30

  constructor(
    private readonly cacheService: IFraudCacheService,
    private readonly threshold: number = 5
  ) {}

  isApplicable(context: FraudEvaluationContext): boolean {
    return context.entityType === EntityType.USER && context.eventType === "USER_LOGIN_FAILED"
  }

  async evaluate(context: FraudEvaluationContext): Promise<FraudSignal | null> {
    const key = `fraud:counter:failed_logins:user:${context.userId}`
    const count = await this.cacheService.incrementWithTtl(key, 900)

    if (count >= this.threshold) {
      return {
        code: this.code,
        description: `Rapid failed login attempts (${count} failures in 15 minutes)`,
        score: this.baseScore + (count - this.threshold) * 5,
        metadata: {
          failedAttempts: count,
          periodMinutes: 15,
          threshold: this.threshold,
        },
      }
    }

    return null
  }
}
