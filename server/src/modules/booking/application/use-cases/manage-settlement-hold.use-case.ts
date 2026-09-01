import { NotFoundError } from "@/common/errors/not-found-error"
import { ConflictError } from "@/common/errors/conflict-error"
import { Settlement, SettlementStatus } from "../../domain/entities/Settlement"
import { ISettlementRepository } from "../../domain/repositories/settlement.repository"
import { IManageSettlementHoldUseCase } from "../interfaces/settlement.usecases"

export class ManageSettlementHoldUseCase implements IManageSettlementHoldUseCase {
  constructor(private readonly settlementRepository: ISettlementRepository) {}

  async hold(settlementId: string, reason: string): Promise<Settlement> {
    const settlement = await this.settlementRepository.findById(settlementId)
    if (!settlement) {
      throw new NotFoundError("Settlement record not found")
    }

    if (settlement.status === SettlementStatus.SETTLED) {
      throw new ConflictError("Cannot hold an already settled payout")
    }

    const updated = await this.settlementRepository.updateStatusWithGuard(
      settlementId,
      SettlementStatus.HELD,
      [SettlementStatus.PENDING, SettlementStatus.PROCESSING, SettlementStatus.FAILED],
      { holdReason: reason || "Admin hold" }
    )

    if (!updated) {
      throw new ConflictError("Failed to hold settlement; current status does not allow hold")
    }

    return updated
  }

  async release(settlementId: string): Promise<Settlement> {
    const settlement = await this.settlementRepository.findById(settlementId)
    if (!settlement) {
      throw new NotFoundError("Settlement record not found")
    }

    if (settlement.status !== SettlementStatus.HELD) {
      throw new ConflictError(`Settlement is not on hold (current status: ${settlement.status})`)
    }

    const updated = await this.settlementRepository.updateStatusWithGuard(
      settlementId,
      SettlementStatus.PENDING,
      [SettlementStatus.HELD],
      { holdReason: undefined }
    )

    if (!updated) {
      throw new ConflictError("Failed to release hold on settlement")
    }

    return updated
  }
}
