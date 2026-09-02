import {
  IGetOnboardingStatusUseCase,
  IOwnerOnboardingDetails,
} from "../interfaces/owner-usecases.interfaces"
import { IOwnerRepository } from "../../domain/repositories/owner.repository"
import { ONBOARDING_STEP } from "../../domain/constants/onboarding-step.constants"

export class GetOnboardingStatusUseCase implements IGetOnboardingStatusUseCase {
  constructor(private readonly ownerRepository: IOwnerRepository) {}

  async execute(userId: string): Promise<{
    step: number
    details: IOwnerOnboardingDetails
    isSubmitted: boolean
  }> {
    const owner = await this.ownerRepository.findByUserId(userId)
    if (!owner) {
      return {
        step: 1,
        details: {} as IOwnerOnboardingDetails,
        isSubmitted: false,
      }
    }

    const details: IOwnerOnboardingDetails = {
      fullName: owner.legalFullName,
      phone: owner.phone,
      whatsapp: owner.whatsapp,
      businessName: owner.businessName,
      gstNumber: owner.gstNumber,
      street1: owner.street1,
      street2: owner.street2,
      city: owner.city,
      state: owner.state,
      postalCode: owner.postalCode,
      country: owner.country,
      idProofType: owner.idProofType,
      idProofUrl: owner.idProofUrl,
      businessLicenseUrl: owner.businessLicenseUrl,
      gstCertificateUrl: owner.gstCertificateUrl,
      accountHolderName: owner.accountHolderName,
      bankName: owner.bankName,
      accountNumber: owner.accountNumber,
      ifscCode: owner.ifscCode,
      bankProofUrl: owner.bankProofUrl,
      rejectionReason: owner.rejectionReason,
    }

    return {
      step: owner.onboardingStep ?? 1,
      details,
      isSubmitted: owner.onboardingStep === ONBOARDING_STEP.IN_REVIEW,
    }
  }
}
