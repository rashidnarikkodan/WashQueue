import { NotFoundError } from "@/common/errors/not-found-error"
import { ConflictError } from "@/common/errors/conflict-error"
import {
  Settlement,
  SettlementHoldReason,
  SettlementStatus,
} from "../../domain/entities/Settlement"
import { ISettlementRepository } from "../../domain/repositories/settlement.repository"
import { IProcessSettlementUseCase } from "../interfaces/settlement.usecases"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { ITransferService } from "@/core/application/interfaces/transfer.interface"
import { IPaymentAccountService } from "@/core/application/interfaces/payment-account.interface"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { PaymentMethod } from "@/common/constants/payment.constants"
import logger from "@/configs/logger.config"

export class ProcessSettlementUseCase implements IProcessSettlementUseCase {
  constructor(
    private readonly settlementRepository: ISettlementRepository,
    private readonly ownerRepository: IOwnerRepository,
    private readonly transferService: ITransferService,
    private readonly bookingRepository?: IBookingRepository,
    private readonly paymentAccountService?: IPaymentAccountService,
    private readonly userRepository?: IUserRepository
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
        `Settlement ${settlement.id} marked FAILED: Owner ${settlement.ownerId} not found`
      )
      return settlement
    }

    // Check if booking was cash / walk-in where funds were collected directly by station
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

    // Attempt auto-creation of linked payout account if owner has bank details but missing transferId
    if (
      !owner.transferId &&
      this.paymentAccountService &&
      this.userRepository &&
      owner.accountNumber &&
      owner.ifscCode
    ) {
      try {
        const user = await this.userRepository.findById(owner.userId)
        const legalName = owner.legalFullName?.trim() || user?.name?.trim() || "Owner"
        const businessName = owner.businessName?.trim() || legalName
        const email = (owner.businessEmail || user?.email)?.trim()
        const phone = (owner.phone || user?.phone)?.trim()
        const street1 = owner.street1?.trim() || "Main Street"
        const city = owner.city?.trim() || "City"
        const state = owner.state?.trim() || "State"
        const postalCode = owner.postalCode?.trim() || "000000"

        if (email && phone) {
          const transferId = await this.paymentAccountService.createAccount({
            email,
            phone,
            legal_business_name: businessName,
            business_type: owner.gstNumber ? "proprietorship" : "individual",
            contact_name: legalName,
            reference_id: (owner.id || String(owner.userId)).slice(-20),
            customer_facing_business_name: businessName,
            profile: {
              category: "services",
              subcategory: "laundry_services",
              addresses: {
                registered: {
                  street1,
                  street2: owner.street2?.trim() || undefined,
                  city,
                  state,
                  postal_code: postalCode,
                  country: owner.country?.trim() || "IN",
                },
              },
            },
            notes: {
              ownerId: owner.id || "",
              userId: String(owner.userId),
            },
            bankAccount: {
              account_number: owner.accountNumber,
              ifsc_code: owner.ifscCode,
              beneficiary_name: owner.accountHolderName || legalName,
            },
          })

          if (transferId) {
            owner.setTransferId(transferId)
            await this.ownerRepository.save(owner)
            logger.info(`Auto-created Razorpay linked account ${transferId} for owner ${owner.id}`)
          }
        }
      } catch (accErr: unknown) {
        logger.warn(
          { err: accErr, ownerId: owner.id },
          "Failed to auto-create Razorpay linked account during settlement processing"
        )
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
      throw new ConflictError(
        "Settlement is already processing or has already reached final status"
      )
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
        guardedSettlement.markFailed(
          `Transfer failed with provider status: ${transferResult.status}`
        )
        if (transferResult.transferId) {
          guardedSettlement.setTransferId(transferResult.transferId)
        }
        logger.error(
          `Settlement ${guardedSettlement.id} transfer failed with status ${transferResult.status}`
        )
      }
    } catch (error: unknown) {
      const errMessage =
        error instanceof Error ? error.message : "Failed to execute payment transfer"
      guardedSettlement.markFailed(errMessage)
      logger.error(`Error executing transfer for settlement ${guardedSettlement.id}: ${errMessage}`)
    }

    return await this.settlementRepository.save(guardedSettlement)
  }
}
