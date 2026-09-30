import { IFraudRule, FraudEvaluationContext } from "../../../domain/services/fraud-rule.interface"
import { FraudSignal } from "../../../domain/value-objects/fraud-types.vo"
import { IFraudCacheService } from "../../../domain/services/fraud-cache.interface"

export class DeviceAccountSharingRule implements IFraudRule {
  readonly code = "ACCT_DEVICE_SHARING"
  readonly description = "Single hardware device identifier linked to multiple accounts"
  readonly baseScore = 40

  constructor(
    private readonly cacheService: IFraudCacheService,
    private readonly threshold: number = 3
  ) {}

  isApplicable(context: FraudEvaluationContext): boolean {
    return Boolean(context.deviceId)
  }

  async evaluate(context: FraudEvaluationContext): Promise<FraudSignal | null> {
    if (!context.deviceId) return null

    const key = `fraud:set:device_users:${context.deviceId}`
    await this.cacheService.addToSetWithTtl(key, context.userId, 172800)
    const userCount = await this.cacheService.getSetCardinality(key)

    if (userCount > this.threshold) {
      return {
        code: this.code,
        description: `Device ${context.deviceId} associated with ${userCount} distinct user accounts`,
        score: this.baseScore + (userCount - this.threshold) * 5,
        metadata: {
          deviceId: context.deviceId,
          associatedUserCount: userCount,
          threshold: this.threshold,
        },
      }
    }

    return null
  }
}
