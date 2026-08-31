import { NotFoundError } from "@/common/errors/not-found-error"
import { ConflictError } from "@/common/errors/conflict-error"
import { Settlement, SettlementStatus } from "../../domain/entities/Settlement"
import { ISettlementRepository } from "../../domain/repositories/settlement.repository"
import { IProcessSettlementUseCase } from "../interfaces/settlement.usecases"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { ITransferService } from "@/core/application/interfaces/transfer.interface"
import logger from "@/configs/logger.config"

export class ProcessSettlementUseCase implements IProcessSettlementUseCase {
  constructor(
    private readonly settlementRepository: ISettlementRepository,
    private readonly ownerRepository: IOwnerRepository,
    private readonly transferService: ITransferService
  ) {}

  async execute(settlementId: string): Promise<Settlement> {
    const settlement = await this.settlementRepository.findById(settlementId)
    if (!settlement) {
      throw new NotFoundError("Settlement data with this id is not available")
    }

    if (settlement.status === SettlementStatus.SETTLED) {
      throw new ConflictError("Settlement is already settled")
    }

    let owner = await this.ownerRepository.findByUserId(settlement.ownerId)
    if (!owner) {
      owner = await this.ownerRepository.findById(settlement.ownerId)
    }

    if (!owner) {
      settlement.markFailed()
      await this.settlementRepository.save(settlement)
      throw new NotFoundError("Owner associated with this settlement not found")
    }

    if (!owner.transferId) {
      settlement.markFailed()
      await this.settlementRepository.save(settlement)
      logger.warn(
        `Settlement ${settlement.id} marked FAILED: owner ${settlement.ownerId} does not have a linked transfer account`
      )
      return settlement
    }

    const amountInPaise = Math.round(settlement.stationSettlementAmount * 100)

    if (amountInPaise <= 0) {
      settlement.markSettled()
      return await this.settlementRepository.save(settlement)
    }

    try {
      const transferResult = await this.transferService.transfer({
        amountInPaise,
        currency: "INR",
        recipientId: owner.transferId,
        referenceId: settlement.id || `settle_${settlement.bookingId}`,
      })

      if (transferResult.status === "SUCCESS") {
        settlement.setTransferId(transferResult.transferId)
        settlement.markSettled()
        logger.info(
          `Settlement ${settlement.id} successfully settled with transfer ${transferResult.transferId}`
        )
      } else {
        if (transferResult.transferId) {
          settlement.setTransferId(transferResult.transferId)
        }
        settlement.markFailed()
        logger.error(
          `Settlement ${settlement.id} transfer failed with status ${transferResult.status}`
        )
      }
    } catch (error: any) {
      settlement.markFailed()
      logger.error(
        `Error executing transfer for settlement ${settlement.id}: ${error.message}`
      )
    }

    return await this.settlementRepository.save(settlement)
  }
}