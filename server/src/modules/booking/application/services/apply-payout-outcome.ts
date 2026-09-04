import { Payout, PayoutStatus } from "../../domain/entities/Payout"
import { Settlement, SettlementStatus } from "../../domain/entities/Settlement"
import logger from "@/configs/logger.config"

export interface PayoutOutcome {
  status: PayoutStatus
  failureReason?: string
}

/**
 * Applies a payout provider result (from a create/get call or a webhook event) to both the
 * Payout and Settlement entities via their own guarded transition methods. Centralized so the
 * synchronous processing path and the webhook path can never apply conflicting state rules.
 */
export function applyPayoutOutcome(
  payout: Payout,
  settlement: Settlement,
  result: PayoutOutcome
): void {
  try {
    switch (result.status) {
      case PayoutStatus.PROCESSED:
        if (payout.status !== PayoutStatus.PROCESSED) payout.markProcessed()
        if (settlement.status !== SettlementStatus.PROCESSED) {
          settlement.markProcessed(payout.id)
        }
        break
      case PayoutStatus.FAILED:
        if (payout.status !== PayoutStatus.FAILED) payout.markFailed(result.failureReason)
        if (settlement.status !== SettlementStatus.FAILED) {
          settlement.markFailed(result.failureReason || "Payout failed")
        }
        break
      case PayoutStatus.REVERSED:
        if (payout.status !== PayoutStatus.REVERSED) payout.markReversed(result.failureReason)
        if (settlement.status === SettlementStatus.PROCESSED) {
          settlement.markReversed(result.failureReason)
        }
        break
      case PayoutStatus.QUEUED:
        if (payout.status === PayoutStatus.PENDING) payout.markQueued()
        break
      case PayoutStatus.PROCESSING:
      default:
        if (payout.status === PayoutStatus.PENDING || payout.status === PayoutStatus.QUEUED) {
          payout.markProcessing()
        }
        break
    }
  } catch (err: unknown) {
    logger.warn(
      { err, payoutId: payout.id, settlementId: settlement.id, targetStatus: result.status },
      "Ignored invalid payout/settlement status transition while applying payout outcome"
    )
  }
}
