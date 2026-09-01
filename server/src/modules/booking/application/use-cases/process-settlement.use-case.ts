import { NotFoundError } from "@/common/errors/not-found-error"
import { ConflictError } from "@/common/errors/conflict-error"
import { Settlement, SettlementHoldReason, SettlementStatus } from "../../domain/entities/Settlement"
import { ISettlementRepository } from "../../domain/repositories/settlement.repository"
import { IProcessSettlementUseCase } from "../interfaces/settlement.usecases"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { ITransferService } from "@/core/application/interfaces/transfer.interface"
import { PaymentMethod } from "@/common/constants/payment.constants"
import logger from "@/configs/logger.config"

export class ProcessSettlementUseCase implements IProcessSettlementUseCase {
  constructor(
    private readonly settlementRepository: ISettlementRepository,
    private readonly ownerRepository: IOwnerRepository,
    private readonly transferService: ITransferService,
    private readonly bookingRepository?: IBookingRepository
  ) {}

  async execute(settlementId: string): Promise<Settlement> {
    const settlement = await this.settlementRepository.findById(settlementId)
    if (!settlement) {
      throw new NotFoundError("Settlement record not found")
    }

    // Idempotency: Already settled
    if (settlement.status === SettlementStatus.SETTLED) {
      return settlement
    }

    // Idempotency: Already in flight
    if (settlement.status === SettlementStatus.PROCESSING) {
      throw new ConflictError("Settlement is currently being processed by another transaction")
    }

    let owner = await this.ownerRepository.findByUserId(settlement.ownerId)
    if (!owner) {
      owner = await this.ownerRepository.findById(settlement.ownerId)
    }

    if (!owner) {
      settlement.markFailed("Owner associated with this settlement was not found")
      await this.settlementRepository.save(settlement)
      throw new NotFoundError("Owner associated with this settlement not found")
    }

    // Check if booking was cash / walk-in where funds were collected directly by station
    if (this.bookingRepository) {
      const booking = await this.bookingRepository.findById(settlement.bookingId)
      if (booking) {
        const isOfflineCash =
          booking.isWalkIn ||
          booking.paymentMethod === PaymentMethod.NO_PAYMENT ||
          (booking.paymentMethod === PaymentMethod.PAY_AT_STATION && booking.depositAmount === 0)

        if (isOfflineCash) {
          settlement.markSettled("OFFLINE_CASH_COLLECTED")
          logger.info(
            `Settlement ${settlement.id} settled as OFFLINE_CASH_COLLECTED for booking ${booking.id}`
          )
          return await this.settlementRepository.save(settlement)
        }
      }
    }

    // Check if owner has a linked transfer/payout account
    if (!owner.transferId) {
      settlement.markHeld(SettlementHoldReason.MISSING_PAYOUT_ACCOUNT)
      await this.settlementRepository.save(settlement)
      logger.warn(
        `Settlement ${settlement.id} marked HELD: Owner ${settlement.ownerId} has no linked payout transfer account`
      )
      return settlement
    }

    const amountInPaise = Math.round(settlement.stationSettlementAmount * 100)

    if (amountInPaise <= 0) {
      settlement.markSettled("ZERO_AMOUNT_SETTLED")
      return await this.settlementRepository.save(settlement)
    }

    // Atomically transition status to PROCESSING with concurrency guard
    const guardedSettlement = await this.settlementRepository.updateStatusWithGuard(
      settlement.id!,
      SettlementStatus.PROCESSING,
      [SettlementStatus.PENDING, SettlementStatus.FAILED, SettlementStatus.HELD]
    )

    if (!guardedSettlement) {
      throw new ConflictError("Settlement is already processing or has already reached final status")
    }

    try {
      const transferResult = await this.transferService.transfer({
        amountInPaise,
        currency: guardedSettlement.currency || "INR",
        recipientId: owner.transferId,
        referenceId: guardedSettlement.id || `settle_${guardedSettlement.bookingId}`,
      })

      if (transferResult.status === "SUCCESS") {
        guardedSettlement.markSettled(transferResult.transferId)
        logger.info(
          `Settlement ${guardedSettlement.id} successfully settled with transfer ${transferResult.transferId}`
        )
      } else {
        guardedSettlement.markFailed(`Transfer failed with provider status: ${transferResult.status}`)
        if (transferResult.transferId) {
          guardedSettlement.setTransferId(transferResult.transferId)
        }
        logger.error(
          `Settlement ${guardedSettlement.id} transfer failed with status ${transferResult.status}`
        )
      }
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : "Failed to execute payment transfer"
      guardedSettlement.markFailed(errMessage)
      logger.error(
        `Error executing transfer for settlement ${guardedSettlement.id}: ${errMessage}`
      )
    }

    return await this.settlementRepository.save(guardedSettlement)
  }
}