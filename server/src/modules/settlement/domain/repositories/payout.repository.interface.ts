import { IBaseRepository } from "@/core/domain/repository.interface"
import { Payout, PayoutProps, PayoutStatus } from "../entities/Payout"

export interface IPayoutRepository extends IBaseRepository<Payout> {
  findBySettlementId(settlementId: string): Promise<Payout | null>
  findByRazorpayPayoutId(razorpayPayoutId: string): Promise<Payout | null>
  updateStatusWithGuard(
    id: string,
    newStatus: PayoutStatus,
    allowedCurrentStatuses: PayoutStatus[],
    updates?: Partial<PayoutProps>
  ): Promise<Payout | null>
}
