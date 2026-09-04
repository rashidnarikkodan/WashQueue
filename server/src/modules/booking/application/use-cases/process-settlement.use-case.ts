import { NotFoundError } from "@/common/errors/not-found-error"
import { ConflictError } from "@/common/errors/conflict-error"
import {
  Settlement,
  SettlementHoldReason,
  SettlementStatus,
} from "../../domain/entities/Settlement"
import { Payout, PayoutStatus, PAYOUT_PROVIDER_RAZORPAY_X } from "../../domain/entities/Payout"
import { ISettlementRepository } from "../../domain/repositories/settlement.repository"
import { IPayoutRepository } from "../../domain/repositories/payout.repository"
import { IProcessSettlementUseCase } from "../interfaces/settlement.usecases"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import {
  IPayoutProvider,
  PayoutProviderResult,
} from "@/core/application/interfaces/payout-provider.interface"
import { PaymentMethod } from "@/common/constants/payment.constants"
import { applyPayoutOutcome } from "../services/apply-payout-outcome"
import logger from "@/configs/logger.config"

export class ProcessSettlementUseCase implements IProcessSettlementUseCase {
  constructor(
    private readonly settlementRepository: ISettlementRepository,
    private readonly payoutRepository: IPayoutRepository,
    private readonly ownerRepository: IOwnerRepository,
    private readonly payoutProvider: IPayoutProvider,
    private readonly bookingRepository?: IBookingRepository
  ) {}

  async execute(settlementId: string): Promise<Settlement> {
    const settlement = await this.settlementRepository.findById(settlementId)
    if (!settlement) {
      throw new NotFoundError("Settlement record not found")
    }

    // Idempotency: Already processed
    if (settlement.status === SettlementStatus.PROCESSED) {
      return settlement
    }

    // Idempotency: Already in flight
    if (settlement.status === SettlementStatus.PROCESSING) {
      throw new ConflictError("Settlement is currently being processed by another transaction")
    }

    let owner = null
    if (settlement.ownerId) {
      owner = await this.ownerRepository.findByUserId(settlement.ownerId)
      if (!owner) {
        owner = await this.ownerRepository.findById(settlement.ownerId)
      }
    }

    let booking = null
    if (this.bookingRepository && settlement.bookingId) {
      booking = await this.bookingRepository.findById(settlement.bookingId)
      if (!owner && booking?.ownerId) {
        owner = await this.ownerRepository.findByUserId(booking.ownerId)
        if (!owner) {
          owner = await this.ownerRepository.findById(booking.ownerId)
        }
      }
    }

    if (!owner) {
      settlement.markFailed("Owner associated with this settlement was not found")
      await this.settlementRepository.save(settlement)
      logger.warn(
        { settlementId: settlement.id, ownerId: settlement.ownerId },
        "Settlement marked FAILED: owner not found"
      )
      return settlement
    }

    // Cash / walk-in bookings where funds were collected directly by the station never move
    // through a payout — mark the amount owed as settled immediately, no Payout record needed.
    if (booking) {
      const isOfflineCash =
        booking.isWalkIn ||
        booking.paymentMethod === PaymentMethod.NO_PAYMENT ||
        (booking.paymentMethod === PaymentMethod.PAY_AT_STATION && booking.depositAmount === 0)

      if (isOfflineCash) {
        settlement.markProcessed()
        logger.info(
          { settlementId: settlement.id, bookingId: booking.id },
          "Settlement processed: offline cash collected by station, no payout required"
        )
        return await this.settlementRepository.save(settlement)
      }
    }

    // Ensure the owner has a RazorpayX payout destination (contact + fund account). This is
    // normally created once during owner-approval; this is a resilience fallback for owners
    // who added bank details after approval. ensurePayoutDestination never recreates existing ids.
    if (!owner.razorpayFundAccountId && owner.accountNumber && owner.ifscCode) {
      try {
        const destination = await this.payoutProvider.ensurePayoutDestination({
          id: owner.id!,
          legalFullName: owner.legalFullName,
          businessName: owner.businessName,
          accountHolderName: owner.accountHolderName,
          businessEmail: owner.businessEmail,
          phone: owner.phone,
          accountNumber: owner.accountNumber,
          ifscCode: owner.ifscCode,
          razorpayContactId: owner.razorpayContactId,
          razorpayFundAccountId: owner.razorpayFundAccountId,
        })
        owner.setRazorpayContactId(destination.contactId)
        owner.setRazorpayFundAccountId(destination.fundAccountId)
        await this.ownerRepository.save(owner)
        logger.info(
          { ownerId: owner.id, fundAccountId: destination.fundAccountId },
          "RazorpayX payout destination resolved for owner during settlement processing"
        )
      } catch (err: unknown) {
        logger.warn(
          { err, ownerId: owner.id },
          "Failed to resolve RazorpayX payout destination during settlement processing"
        )
      }
    }

    if (!owner.razorpayFundAccountId) {
      settlement.markHeld(SettlementHoldReason.MISSING_PAYOUT_ACCOUNT)
      await this.settlementRepository.save(settlement)
      logger.warn(
        { settlementId: settlement.id, ownerId: owner.id },
        "Settlement marked HELD: owner has no RazorpayX payout destination"
      )
      return settlement
    }

    const amountInPaise = Math.round(settlement.stationSettlementAmount * 100)

    if (amountInPaise <= 0) {
      settlement.markProcessed()
      return await this.settlementRepository.save(settlement)
    }

    // Atomically claim the settlement so two concurrent workers can never both process it.
    const guardedSettlement = await this.settlementRepository.updateStatusWithGuard(
      settlement.id!,
      SettlementStatus.PROCESSING,
      [SettlementStatus.PENDING, SettlementStatus.FAILED, SettlementStatus.HELD]
    )

    if (!guardedSettlement) {
      throw new ConflictError(
        "Settlement is already processing or has already reached final status"
      )
    }

    const payout = await this.getOrCreatePayout(guardedSettlement, owner.id!, amountInPaise)
    guardedSettlement.setPayoutId(payout.id!)

    logger.info(
      { settlementId: guardedSettlement.id, payoutId: payout.id, ownerId: owner.id },
      "Settlement claimed for payout processing"
    )

    try {
      let providerResult: PayoutProviderResult
      if (payout.razorpayPayoutId) {
        // A payout was already created against the provider (or the create call previously
        // succeeded but our own persistence step was interrupted) — reconcile, never re-create.
        providerResult = await this.payoutProvider.getPayout(payout.razorpayPayoutId)
      } else {
        logger.info({ payoutId: payout.id }, "Payout creation attempted")
        providerResult = await this.payoutProvider.createPayout({
          fundAccountId: owner.razorpayFundAccountId,
          amountInPaise,
          currency: guardedSettlement.currency,
          referenceId: payout.idempotencyKey,
          narration: `Settlement payout for booking ${guardedSettlement.bookingId}`,
        })
        payout.attachProviderReference(providerResult.providerPayoutId)
        logger.info(
          { payoutId: payout.id, providerPayoutId: providerResult.providerPayoutId },
          "Payout created"
        )
      }

      applyPayoutOutcome(payout, guardedSettlement, providerResult)
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : "Failed to create payout"
      // The provider call's outcome is uncertain (timeout / lost response) as well as permanent
      // failures both land here. The payout row is left as-is (no razorpayPayoutId means a retry
      // will safely re-attempt with the same idempotency key; a permanent failure still requires
      // manual owner-data correction before retrying).
      guardedSettlement.markFailed(errMessage)
      logger.error(
        { err: error, settlementId: guardedSettlement.id, payoutId: payout.id },
        "Payout processing failed for settlement"
      )
    }

    await this.payoutRepository.save(payout)
    return await this.settlementRepository.save(guardedSettlement)
  }

  private async getOrCreatePayout(
    settlement: Settlement,
    ownerId: string,
    amountInPaise: number
  ): Promise<Payout> {
    const existing = await this.payoutRepository.findBySettlementId(settlement.id!)
    if (existing) {
      return existing
    }

    const payout = new Payout({
      settlementId: settlement.id!,
      ownerId,
      provider: PAYOUT_PROVIDER_RAZORPAY_X,
      amount: amountInPaise / 100,
      currency: settlement.currency,
      status: PayoutStatus.PENDING,
      idempotencyKey: `settlement:${settlement.id}`,
      createdAt: new Date(),
    })

    try {
      return await this.payoutRepository.save(payout)
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string }
      if (err?.code === 11000 || err?.message?.includes("E11000")) {
        const raced = await this.payoutRepository.findBySettlementId(settlement.id!)
        if (raced) {
          return raced
        }
      }
      throw error
    }
  }
}
