import { IUserRepository } from "../../domain/repositories/user.repository"
import { User } from "../../domain/entities/User"
import { UpdateUserInput } from "../dto/update-user.dto"
import { IUpdateUserUseCase } from "../interfaces/user-usecases.interfaces"
import { ICacheService } from "@/core/application/interfaces/cache.interface"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { Owner } from "@/modules/owner/domain/entities/Owner"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { ROLE } from "@/common/constants/role.constants"

import { IMailService } from "@/modules/auth/application/interfaces/mail-service.interface"

const BLOCKED_USER_TTL_SECONDS = 30 * 24 * 60 * 60 // 30 days

export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly cacheService: ICacheService,
    private readonly ownerRepository: IOwnerRepository,
    private readonly mailService: IMailService
  ) {}

  async execute(id: string, updates: UpdateUserInput): Promise<User | null> {
    const user = await this.userRepository.findById(id)
    if (!user) return null

    // Safety guard: admin accounts can never be blocked
    if (updates.isBlocked === true && user.role === ROLE.ADMIN) {
      throw new ForbiddenError("Admin accounts cannot be suspended")
    }

    const updatedUser = await this.userRepository.update(id, updates)

    if (updatedUser && typeof updates.isBlocked === "boolean") {
      const key = `blocked:${id}`
      try {
        if (updates.isBlocked) {
          // Blacklist user session. Set TTL to 30 days.
          await this.cacheService.set(key, "true", BLOCKED_USER_TTL_SECONDS)
        } else {
          await this.cacheService.del(key)
        }
      } catch (cacheError) {
        // Redis operation failed — roll back the DB change to keep them in sync
        await this.userRepository.update(id, { isBlocked: user.isBlocked })
        throw cacheError
      }
    }

    if (user.role === ROLE.OWNER) {
      const owner = await this.ownerRepository.findByUserId(id)
      if (owner) {
        // Send email notifications on verification status changes
        const wasVerified = owner.isVerified === true
        const isVerifiedNow = updates.isVerified === true

        // 1. Approval email trigger
        if (!wasVerified && isVerifiedNow) {
          await this.mailService.sendOwnerApprovalEmail(
            user.email,
            owner.legalFullName || user.name || "Owner"
          )
        }

        // 2. Rejection email trigger: Transition from in-review (step 4) back to step 1 with isVerified = false
        const wasInReview = owner.onboardingStep === 4
        const isRejectedNow = updates.onboardingStep === 1 && updates.isVerified === false
        if (wasInReview && isRejectedNow) {
          const reason =
            updates.rejectionReason ||
            "Please review your verification documents and business information and resubmit."
          await this.mailService.sendOwnerRejectionEmail(
            user.email,
            owner.legalFullName || user.name || "Owner",
            reason
          )
        }

        const updatedOwner = new Owner({
          id: owner.id,
          userId: id,
          phone: updates.phone !== undefined ? updates.phone : owner.phone,
          onboardingStep:
            updates.onboardingStep !== undefined ? updates.onboardingStep : owner.onboardingStep,
          isVerified: updates.isVerified !== undefined ? updates.isVerified : owner.isVerified,
          verifiedAt: updates.isVerified ? new Date() : owner.verifiedAt,
          legalFullName: owner.legalFullName,
          businessName: owner.businessName,
          gstNumber: owner.gstNumber,
          whatsapp: owner.whatsapp,
          businessEmail: owner.businessEmail,
          idProofType: owner.idProofType,
          idProofUrl: owner.idProofUrl,
          businessLicenseUrl: owner.businessLicenseUrl,
          gstCertificateUrl: owner.gstCertificateUrl,
          accountHolderName: owner.accountHolderName,
          bankName: owner.bankName,
          accountNumber: owner.accountNumber,
          ifscCode: owner.ifscCode,
          bankProofUrl: owner.bankProofUrl,
          rejectionReason: updates.isVerified
            ? ""
            : updates.rejectionReason !== undefined
              ? updates.rejectionReason
              : owner.rejectionReason,
        })
        await this.ownerRepository.save(updatedOwner)
      }
    }

    return updatedUser
  }
}
