import { IFraudRule, FraudEvaluationContext } from "../../../domain/services/fraud-rule.interface"
import { FraudSignal } from "../../../domain/value-objects/fraud-types.vo"

export class SuspendedAccountActivityRule implements IFraudRule {
  readonly code = "ACCT_SUSPENDED_ACTIVITY"
  readonly description = "Attempted actions from a blocked or suspended account"
  readonly baseScore = 60

  isApplicable(context: FraudEvaluationContext): boolean {
    return Boolean(context.payload?.isBlocked || context.payload?.isSuspended)
  }

  async evaluate(context: FraudEvaluationContext): Promise<FraudSignal | null> {
    if (context.payload?.isBlocked || context.payload?.isSuspended) {
      return {
        code: this.code,
        description: `Action attempted by user ${context.userId} marked as blocked/suspended`,
        score: this.baseScore,
        metadata: {
          userId: context.userId,
          eventType: context.eventType,
        },
      }
    }

    return null
  }
}
