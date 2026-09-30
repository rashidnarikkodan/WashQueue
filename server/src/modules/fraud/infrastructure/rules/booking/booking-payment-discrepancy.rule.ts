import { IFraudRule, FraudEvaluationContext } from "../../../domain/services/fraud-rule.interface"
import { FraudSignal, EntityType } from "../../../domain/value-objects/fraud-types.vo"

export class BookingPaymentDiscrepancyRule implements IFraudRule {
  readonly code = "BOOKING_PAYMENT_MISMATCH"
  readonly description = "Payment verification amount does not match expected booking cost"
  readonly baseScore = 50

  isApplicable(context: FraudEvaluationContext): boolean {
    return (
      context.entityType === EntityType.BOOKING &&
      context.eventType === "BOOKING_PAYMENT_VERIFIED" &&
      context.payload !== undefined &&
      "expectedAmount" in context.payload &&
      "paidAmount" in context.payload
    )
  }

  async evaluate(context: FraudEvaluationContext): Promise<FraudSignal | null> {
    const expected = Number(context.payload?.expectedAmount)
    const paid = Number(context.payload?.paidAmount)

    if (!isNaN(expected) && !isNaN(paid) && Math.abs(expected - paid) > 0.01) {
      return {
        code: this.code,
        description: `Discrepancy detected: Expected ${expected} but received ${paid}`,
        score: this.baseScore,
        metadata: {
          expectedAmount: expected,
          paidAmount: paid,
          diff: Math.abs(expected - paid),
        },
      }
    }

    return null
  }
}
