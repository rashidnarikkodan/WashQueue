import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import {
  IGetOnboardingStatusUseCase,
  IOwnerOnboardingDetails,
} from "../interfaces/owner-usecases.interfaces"
import { IOwnerRepository } from "../../domain/repositories/owner.repository"

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
      businessType: owner.businessType,
      gstNumber: owner.gstNumber,
      idProofType: owner.idProofType,
      idProofUrl: owner.idProofUrl,
      businessLicenseUrl: owner.businessLicenseUrl,
      gstCertificateUrl: owner.gstCertificateUrl,
      accountHolderName: owner.accountHolderName,
      bankName: owner.bankName,
      accountNumber: owner.accountNumber,
      ifscCode: owner.ifscCode,
      accountType: owner.accountType,
      bankProofUrl: owner.bankProofUrl,
    }

    return {
      step: owner.onboardingStep ?? 1,
      details,
      isSubmitted: owner.onboardingStep === 4,
    }
  }
}
