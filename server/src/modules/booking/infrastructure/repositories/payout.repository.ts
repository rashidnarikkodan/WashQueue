import { BaseRepository } from "@/infrastructure/database/repository/base.repository"
import { IPayoutRepository } from "../../domain/repositories/payout.repository"
import { Payout, PayoutProps, PayoutStatus } from "../../domain/entities/Payout"
import PayoutModel, { IPayoutDocument } from "../models/payout.model"
import { PayoutMapper } from "../mappers/payout.mapper"

export class PayoutRepository
  extends BaseRepository<Payout, IPayoutDocument>
  implements IPayoutRepository
{
  constructor() {
    super(PayoutModel, new PayoutMapper())
  }

  async findBySettlementId(settlementId: string): Promise<Payout | null> {
    const doc = await this.model.findOne({ settlementId }).exec()
    return doc ? this.mapper.toDomain(doc) : null
  }

  async findByRazorpayPayoutId(razorpayPayoutId: string): Promise<Payout | null> {
    const doc = await this.model.findOne({ razorpayPayoutId }).exec()
    return doc ? this.mapper.toDomain(doc) : null
  }

  async updateStatusWithGuard(
    id: string,
    newStatus: PayoutStatus,
    allowedCurrentStatuses: PayoutStatus[],
    updates?: Partial<PayoutProps>
  ): Promise<Payout | null> {
    const updateObj: Record<string, unknown> = {
      status: newStatus,
      updatedAt: new Date(),
    }

    if (updates) {
      if (updates.razorpayPayoutId !== undefined)
        updateObj.razorpayPayoutId = updates.razorpayPayoutId
      if (updates.failureReason !== undefined) updateObj.failureReason = updates.failureReason
      if (updates.processedAt !== undefined) updateObj.processedAt = updates.processedAt
      if (updates.failedAt !== undefined) updateObj.failedAt = updates.failedAt
      if (updates.reversedAt !== undefined) updateObj.reversedAt = updates.reversedAt
    }

    const doc = await this.model
      .findOneAndUpdate(
        { _id: id, status: { $in: allowedCurrentStatuses } },
        { $set: updateObj },
        { new: true }
      )
      .exec()

    return doc ? this.mapper.toDomain(doc) : null
  }
}
