import { ISettlementRepository } from "../../domain/repositories/settlement.repository"
import { SettlementStatus } from "../../domain/entities/Settlement"
import { IProcessSettlementUseCase } from "../interfaces/settlement.usecases"
import logger from "@/configs/logger.config"

const BATCH_SIZE = 50

export interface IProcessPendingSettlementsUseCase {
  execute(): Promise<void>
}

export class ProcessPendingSettlementsUseCase implements IProcessPendingSettlementsUseCase {
  constructor(
    private readonly settlementRepository: ISettlementRepository,
    private readonly processSettlementUseCase: IProcessSettlementUseCase
  ) {}

  async execute(): Promise<void> {
    const { settlements } = await this.settlementRepository.findMany({
      status: SettlementStatus.PENDING,
      page: 1,
      limit: BATCH_SIZE,
    })

    for (const settlement of settlements) {
      if (!settlement.id) continue
      try {
        await this.processSettlementUseCase.execute(settlement.id)
      } catch (err: unknown) {
        logger.warn(
          { err, settlementId: settlement.id },
          "Failed to process pending settlement in background job"
        )
      }
    }
  }
}
