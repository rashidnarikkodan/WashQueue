import { IOwnerRepository } from "../../domain/repositories/owner.repository"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IMailService } from "@/core/application/interfaces/mail.interface"
import { ONBOARDING_STEP } from "../../domain/constants/onboarding-step.constants"
import { NotFoundError } from "@/common/errors/not-found-error"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { Owner } from "../../domain/entities/Owner"
import { IApproveOwnerUseCase } from "../interfaces/owner-usecases.interfaces"
import { ApproveOwnerInput } from "../dto/approve-owner.dto"
import { IPayoutProvider } from "@/core/application/interfaces/payout-provider.interface"

export class ApproveOwnerUseCase implements IApproveOwnerUseCase {
  constructor(
    private readonly ownerRepository: IOwnerRepository,
    private readonly userRepository: IUserRepository,
    private readonly mailService: IMailService,
    private readonly payoutProvider: IPayoutProvider
  ) {}

  async execute({
    ownerIdOrUserId,
    isApproved,
    rejectionReason,
  }: ApproveOwnerInput): Promise<Owner> {
    let owner = await this.ownerRepository.findByUserId(ownerIdOrUserId)
    if (!owner) {
      owner = await this.ownerRepository.findById(ownerIdOrUserId)
    }

    if (!owner) {
      throw new NotFoundError("Owner application not found")
    }

    const user = await this.userRepository.findById(owner.userId)
    if (!user) {
      throw new NotFoundError("Associated user account not found")
    }

    const displayName = owner.legalFullName || user.name || "Owner"

    if (isApproved) {
      owner.verify()

      // Create the owner's RazorpayX payout destination (contact + fund account) once, during
      // approval, so settlement processing never has to create it on the critical path.
      if (!owner.razorpayFundAccountId) {
        const legalName = owner.legalFullName?.trim() || user.name?.trim()
        const email = (owner.businessEmail || user.email)?.trim()
        const phone = (owner.phone || user.phone)?.trim()
        const accountNumber = owner.accountNumber?.trim()
        const ifscCode = owner.ifscCode?.trim()
        const accountHolderName = owner.accountHolderName?.trim() || legalName

        if (!legalName) {
          throw new AppError(
            "Owner full name is required to create payout account",
            HTTP_STATUS.BAD_REQUEST
          )
        }
        if (!email) {
          throw new AppError(
            "Owner email is required to create payout account",
            HTTP_STATUS.BAD_REQUEST
          )
        }
        if (!phone) {
          throw new AppError(
            "Owner phone is required to create payout account",
            HTTP_STATUS.BAD_REQUEST
          )
        }
        if (!accountNumber || !ifscCode) {
          throw new AppError(
            "Owner bank account details are required to create payout account",
            HTTP_STATUS.BAD_REQUEST
          )
        }

        const destination = await this.payoutProvider.ensurePayoutDestination({
          id: owner.id || String(owner.userId),
          legalFullName: legalName,
          businessName: owner.businessName,
          accountHolderName,
          businessEmail: email,
          phone,
          accountNumber,
          ifscCode,
          razorpayContactId: owner.razorpayContactId,
          razorpayFundAccountId: owner.razorpayFundAccountId,
        })

        owner.setRazorpayContactId(destination.contactId)
        owner.setRazorpayFundAccountId(destination.fundAccountId)
      }

      await this.ownerRepository.save(owner)
      await this.userRepository.update(owner.userId, { isVerified: true })

      try {
        await this.mailService.sendOwnerApprovalEmail(user.email, displayName)
      } catch {
        // Log mail error if any, but do not fail the transaction
      }
    } else {
      const reason =
        rejectionReason?.trim() ||
        "Please review your verification documents and business information and resubmit."

      owner.reject(reason)
      owner.setOnboardingStep(ONBOARDING_STEP.FIRST_STEP)
      await this.ownerRepository.save(owner)
      await this.userRepository.update(owner.userId, { isVerified: false })

      try {
        await this.mailService.sendOwnerRejectionEmail(user.email, displayName, reason)
      } catch {
        // Log mail error if any, but do not fail the transaction
      }
    }

    return owner
  }
}
