import { NotFoundError } from "@/common/errors/not-found-error"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { ISettlementRepository } from "../../domain/repositories/settlement.repository"
import { OwnerEarningsSummaryDTO } from "../dtos/settlement.dto"
import { IGetOwnerSettlementSummaryUseCase } from "../interfaces/settlement.usecases"

export class GetOwnerSettlementSummaryUseCase implements IGetOwnerSettlementSummaryUseCase {
  constructor(
    private readonly settlementRepository: ISettlementRepository,
    private readonly ownerRepository: IOwnerRepository
  ) {}

  async execute(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<OwnerEarningsSummaryDTO> {
    let owner = await this.ownerRepository.findByUserId(userId)
    if (!owner) {
      owner = await this.ownerRepository.findById(userId)
    }

    if (!owner || !owner.id) {
      throw new NotFoundError("Owner profile not found for this user")
    }

    const aggregated = await this.settlementRepository.getOwnerAggregatedEarnings(
      owner.id,
      startDate,
      endDate
    )

    let accountNumberMasked: string | undefined
    if (owner.accountNumber) {
      const acc = owner.accountNumber.trim()
      accountNumberMasked = acc.length > 4 ? `•••• •••• ${acc.slice(-4)}` : `•••• ${acc}`
    }

    return {
      ...aggregated,
      payoutAccountStatus: {
        hasLinkedAccount: Boolean(owner.razorpayFundAccountId),
        razorpayFundAccountId: owner.razorpayFundAccountId,
        bankName: owner.bankName,
        accountHolderName: owner.accountHolderName,
        accountNumberMasked,
      },
    }
  }
}
