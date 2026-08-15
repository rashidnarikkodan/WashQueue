import { IOwnerRepository } from "../../domain/repositories/owner.repository"
import { Owner } from "../../domain/entities/Owner"
import { ONBOARDING_STEP } from "../../domain/constants/onboarding-step.constants"
import { IMailService } from "@/core/application/interfaces/mail.interface"
import {
  IOwnerVerificationStatusService,
  OwnerVerificationStatusChangeInput,
} from "../interfaces/owner-verification-status.interface"

export class OwnerVerificationStatusService implements IOwnerVerificationStatusService {
  constructor(
    private readonly ownerRepository: IOwnerRepository,
    private readonly mailService: IMailService
  ) {}

  async handleVerificationStatusChange({
    userId,
    userEmail,
    userName,
    updates,
  }: OwnerVerificationStatusChangeInput): Promise<void> {
    const owner = await this.ownerRepository.findByUserId(userId)
    if (!owner) return

    const displayName = owner.legalFullName || userName || "Owner"

    // Approval email trigger
    const wasVerified = owner.isVerified === true
    const isVerifiedNow = updates.isVerified === true
    if (!wasVerified && isVerifiedNow) {
      await this.mailService.sendOwnerApprovalEmail(userEmail, displayName)
    }

    // Rejection email trigger: transition from in-review back to the first step, unverified
    const wasInReview = owner.onboardingStep === ONBOARDING_STEP.IN_REVIEW
    const isRejectedNow =
      updates.onboardingStep === ONBOARDING_STEP.FIRST_STEP && updates.isVerified === false
    if (wasInReview && isRejectedNow) {
      const reason =
        updates.rejectionReason ||
        "Please review your verification documents and business information and resubmit."
      await this.mailService.sendOwnerRejectionEmail(userEmail, displayName, reason)
    }

    const updatedOwner = new Owner({
      id: owner.id,
      userId,
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
