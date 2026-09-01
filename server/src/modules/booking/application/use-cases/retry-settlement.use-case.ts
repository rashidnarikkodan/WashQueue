import { NotFoundError } from "@/common/errors/not-found-error"
import { ConflictError } from "@/common/errors/conflict-error"
import { Settlement, SettlementStatus } from "../../domain/entities/Settlement"
import { ISettlementRepository } from "../../domain/repositories/settlement.repository"
import { IProcessSettlementUseCase, IRetrySettlementUseCase } from "../interfaces/settlement.usecases"

export class RetrySettlementUseCase implements IRetrySettlementUseCase {
  constructor(
    private readonly settlementRepository: ISettlementRepository,
    private readonly processSettlementUseCase: IProcessSettlementUseCase
  ) {}

  async execute(settlementId: string): Promise<Settlement> {
    const settlement = await this.settlementRepository.findById(settlementId)
    if (!settlement) {
      throw new NotFoundError("Settlement record not found")
    }

    if (settlement.status === SettlementStatus.SETTLED) {
      throw new ConflictError("Settlement is already settled")
    }

    if (settlement.status === SettlementStatus.PROCESSING) {
      throw new ConflictError("Settlement is currently being processed")
    }

    // Reset status to PENDING if HELD or FAILED so processing can cleanly execute
    if (settlement.status === SettlementStatus.HELD || settlement.status === SettlementStatus.FAILED) {
      await this.settlementRepository.updateStatusWithGuard(
        settlement.id!,
        SettlementStatus.PENDING,
        [SettlementStatus.HELD, SettlementStatus.FAILED],
        {
          holdReason: undefined,
          failureReason: undefined,
        }
      )
    }

    return await this.processSettlementUseCase.execute(settlementId)
  }
}
