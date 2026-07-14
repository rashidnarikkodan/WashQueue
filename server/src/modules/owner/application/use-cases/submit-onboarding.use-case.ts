import { User as UserModel } from "@/modules/user/infrastructure/models/user.model"
import { AppError } from "@/shared/errors/app-error"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { ERROR_MESSAGES } from "@/shared/constants/error.constants"
import { TokenService } from "@/modules/auth/infrastructure/services/token.service"
import { ISubmitOnboardingUseCase } from "../interfaces/owner-usecases.interfaces"
import { IOwnerRepository } from "../../domain/repositories/owner.repository"
import { Owner } from "../../domain/entities/Owner"

export class SubmitOnboardingUseCase implements ISubmitOnboardingUseCase {
  constructor(
    private readonly ownerRepository: IOwnerRepository,
    private readonly tokenService: TokenService
  ) {}

  async execute(userId: string): Promise<{
    success: boolean
    message: string
    tokens: { accessToken: string; refreshToken: string }
  }> {
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
        onboardingStep: 4,
        isVerified: false,
      })
    } else {
      owner = new Owner({
        id: userId,
        name: userDoc.name,
        email: userDoc.email,
        phone: userDoc.phone,
        role: "owner",
        isBlocked: userDoc.isBlocked,
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt,
        
        onboardingStep: 4,
        legalFullName: owner.legalFullName,
        businessName: owner.businessName,
        businessType: owner.businessType,
        gstNumber: owner.gstNumber,
        whatsapp: owner.whatsapp,
        businessEmail: owner.businessEmail,
        hasStation: owner.hasStation,
        hasMobileService: owner.hasMobileService,
        mobileActive: owner.mobileActive,
        isVerified: owner.isVerified,
        verifiedAt: owner.verifiedAt,
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
      })
    }

    await this.ownerRepository.save(owner)

    // Mark step=4 to flag submission pending admin review
    const tokenPayload = {
      userId: userDoc.id,
      role: userDoc.role,
      email: userDoc.email,
    }

    const accessToken = this.tokenService.generateAccessToken(tokenPayload)
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload)

    await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          refreshToken,
        },
      },
      { new: true }
    ).exec()

    return {
      success: true,
      message: "Onboarding submitted successfully. Your application is under review.",
      tokens: {
        accessToken,
        refreshToken,
      },
    }
  }
}
