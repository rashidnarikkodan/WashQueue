import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { ITokenService } from "@/modules/auth/application/interfaces"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { RoleType } from "@/common/constants/role.constants"
import {
  ISaveOnboardingStepUseCase,
  IOwnerOnboardingDetails,
} from "../interfaces/owner-usecases.interfaces"
import { IOwnerRepository } from "../../domain/repositories/owner.repository"
import { Owner } from "../../domain/entities/Owner"
import { User } from "@/modules/user/domain/entities/User"

export class SaveOnboardingStepUseCase implements ISaveOnboardingStepUseCase {
  constructor(
    private readonly ownerRepository: IOwnerRepository,
    private readonly tokenService: ITokenService,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    userId: string,
    step: number,
    details: IOwnerOnboardingDetails
  ): Promise<{
    step: number
    details: IOwnerOnboardingDetails
    isSubmitted: boolean
    tokens?: { accessToken: string; refreshToken: string }
  }> {
    // Fetch existing onboarding details to merge (preserve previous step data)
    const userDoc = await this.userRepository.findById(userId)

    if (!userDoc) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }

    let owner = await this.ownerRepository.findByUserId(userId)
    if (!owner) {
      owner = new Owner({
        userId,
        phone: userDoc.phone,
        onboardingStep: 1,
        isVerified: false,
      })
    }

    const updatedOwner = new Owner({
      id: owner.id,
      userId,
      phone: details.phone !== undefined ? details.phone : owner.phone,
      onboardingStep: step,
      legalFullName: details.fullName !== undefined ? details.fullName : owner.legalFullName,
      businessName: details.businessName !== undefined ? details.businessName : owner.businessName,
      gstNumber: details.gstNumber !== undefined ? details.gstNumber : owner.gstNumber,
      whatsapp: details.whatsapp !== undefined ? details.whatsapp : owner.whatsapp,
      businessEmail: details.businessEmail !== undefined ? details.businessEmail : owner.businessEmail,
      isVerified: owner.isVerified,
      verifiedAt: owner.verifiedAt,
      idProofType: details.idProofType !== undefined ? details.idProofType : owner.idProofType,
      idProofUrl: details.idProofUrl !== undefined ? details.idProofUrl : owner.idProofUrl,
      businessLicenseUrl: details.businessLicenseUrl !== undefined ? details.businessLicenseUrl : owner.businessLicenseUrl,
      gstCertificateUrl: details.gstCertificateUrl !== undefined ? details.gstCertificateUrl : owner.gstCertificateUrl,
      accountHolderName: details.accountHolderName !== undefined ? details.accountHolderName : owner.accountHolderName,
      bankName: details.bankName !== undefined ? details.bankName : owner.bankName,
      accountNumber: details.accountNumber !== undefined ? details.accountNumber : owner.accountNumber,
      ifscCode: details.ifscCode !== undefined ? details.ifscCode : owner.ifscCode,
      bankProofUrl: details.bankProofUrl !== undefined ? details.bankProofUrl : owner.bankProofUrl,
    })

    const savedOwner = await this.ownerRepository.save(updatedOwner)

    const mergedDetails: IOwnerOnboardingDetails = {
      fullName: savedOwner.legalFullName,
      phone: savedOwner.phone,
      whatsapp: savedOwner.whatsapp,
      businessName: savedOwner.businessName,
      gstNumber: savedOwner.gstNumber,
      idProofType: savedOwner.idProofType,
      idProofUrl: savedOwner.idProofUrl,
      businessLicenseUrl: savedOwner.businessLicenseUrl,
      gstCertificateUrl: savedOwner.gstCertificateUrl,
      accountHolderName: savedOwner.accountHolderName,
      bankName: savedOwner.bankName,
      accountNumber: savedOwner.accountNumber,
      ifscCode: savedOwner.ifscCode,
      bankProofUrl: savedOwner.bankProofUrl,
    }

    let tokens: { accessToken: string; refreshToken: string } | undefined

    if (userDoc.role !== "owner") {
      const tokenPayload = {
        userId: userDoc.id || userId,
        role: "owner" as RoleType,
        email: userDoc.email,
      }

      const accessToken = this.tokenService.generateAccessToken(tokenPayload)
      const refreshToken = this.tokenService.generateRefreshToken(tokenPayload)

      const userUpdateFields: Partial<User> = {
        role: "owner" as RoleType,
        refreshToken: refreshToken,
      }

      tokens = { accessToken, refreshToken }

      await this.userRepository.update(userId, userUpdateFields)
    }

    return {
      step,
      details: mergedDetails,
      isSubmitted: step === 4,
      tokens,
    }
  }
}
