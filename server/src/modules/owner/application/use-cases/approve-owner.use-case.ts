import { IOwnerRepository } from "../../domain/repositories/owner.repository"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IMailService } from "@/core/application/interfaces/mail.interface"
import { ONBOARDING_STEP } from "../../domain/constants/onboarding-step.constants"
import { NotFoundError } from "@/common/errors/not-found-error"
import { Owner } from "../../domain/entities/Owner"
import { IApproveOwnerUseCase } from "../interfaces/owner-usecases.interfaces"
import { ApproveOwnerInput } from "../dto/approve-owner.dto"
import { IPayoutProvider } from "@/core/application/interfaces/payout-provider.interface"
import { ensureOwnerPayoutAccount } from "../services/ensure-owner-payout-account.service"

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

      await ensureOwnerPayoutAccount(owner, this.payoutProvider, user.name, user.email, user.phone)

      await this.ownerRepository.save(owner)
      await this.userRepository.update(owner.userId, { isVerified: true })

      try {
        await this.mailService.sendOwnerApprovalEmail(user.email, displayName)
      } catch {
        // log error if needed
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
        // log error if needed
      }
    }

    return owner
  }
}
