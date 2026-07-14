import { User as UserModel } from "@/modules/user/infrastructure/models/user.model"
import { AppError } from "@/shared/errors/app-error"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { ERROR_MESSAGES } from "@/shared/constants/error.constants"
import { TokenService } from "@/modules/auth/infrastructure/services/token.service"
import {
  ISaveOnboardingStepUseCase,
  IOwnerOnboardingDetails,
} from "../interfaces/owner-usecases.interfaces"
import { IOwnerRepository } from "../../domain/repositories/owner.repository"
import { Owner } from "../../domain/entities/Owner"

export class SaveOnboardingStepUseCase implements ISaveOnboardingStepUseCase {
  constructor(
    private readonly ownerRepository: IOwnerRepository,
    private readonly tokenService: TokenService
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
    const userDoc = await UserModel.findById(userId).exec()

    if (!userDoc) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }

    let owner = await this.ownerRepository.findByUserId(userId)
    if (!owner) {
      owner = new Owner({
        id: userId,
        email: userDoc.email,
        phone: userDoc.phone,
        role: "owner",
        onboardingStep: 1,
        isVerified: false,
      })
    }

    const updatedOwner = new Owner({
      id: userId,
      name: userDoc.name,
      email: userDoc.email,
      phone: userDoc.phone,
      role: "owner",
      isBlocked: userDoc.isBlocked,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
      
      onboardingStep: step,
      legalFullName: details.fullName !== undefined ? details.fullName : owner.legalFullName,
      businessName: details.businessName !== undefined ? details.businessName : owner.businessName,
      businessType: details.businessType !== undefined ? details.businessType : owner.businessType,
      gstNumber: details.gstNumber !== undefined ? details.gstNumber : owner.gstNumber,
      whatsapp: details.whatsapp !== undefined ? details.whatsapp : owner.whatsapp,
      businessEmail: details.businessEmail !== undefined ? details.businessEmail : owner.businessEmail,
      hasStation: details.hasStation !== undefined ? details.hasStation : owner.hasStation,
      hasMobileService: details.hasMobileService !== undefined ? details.hasMobileService : owner.hasMobileService,
      mobileActive: details.mobileActive !== undefined ? details.mobileActive : owner.mobileActive,
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
      accountType: details.accountType !== undefined ? details.accountType : owner.accountType,
      bankProofUrl: details.bankProofUrl !== undefined ? details.bankProofUrl : owner.bankProofUrl,
    })

    const savedOwner = await this.ownerRepository.save(updatedOwner)

    const mergedDetails: IOwnerOnboardingDetails = {
      fullName: savedOwner.legalFullName,
      phone: userDoc.phone,
      whatsapp: savedOwner.whatsapp,
      businessName: savedOwner.businessName,
      businessType: savedOwner.businessType,
      gstNumber: savedOwner.gstNumber,
      idProofType: savedOwner.idProofType,
      idProofUrl: savedOwner.idProofUrl,
      businessLicenseUrl: savedOwner.businessLicenseUrl,
      gstCertificateUrl: savedOwner.gstCertificateUrl,
      accountHolderName: savedOwner.accountHolderName,
      bankName: savedOwner.bankName,
      accountNumber: savedOwner.accountNumber,
      ifscCode: savedOwner.ifscCode,
      accountType: savedOwner.accountType,
      bankProofUrl: savedOwner.bankProofUrl,
      hasStation: savedOwner.hasStation,
      hasMobileService: savedOwner.hasMobileService,
      mobileActive: savedOwner.mobileActive,
    }

    let tokens: { accessToken: string; refreshToken: string } | undefined

    if (userDoc.role !== "owner") {
      const userUpdateFields: any = {
        role: "owner"
      }

      const tokenPayload = {
        userId: userDoc.id,
        role: "owner",
        email: userDoc.email,
      }

      const accessToken = this.tokenService.generateAccessToken(tokenPayload)
      const refreshToken = this.tokenService.generateRefreshToken(tokenPayload)

      userUpdateFields.refreshToken = refreshToken
      tokens = { accessToken, refreshToken }

      await UserModel.findByIdAndUpdate(
        userId,
        { $set: userUpdateFields },
        { new: true }
      ).exec()
    }

    return {
      step,
      details: mergedDetails,
      isSubmitted: step === 4,
      tokens,
    }
  }
}
