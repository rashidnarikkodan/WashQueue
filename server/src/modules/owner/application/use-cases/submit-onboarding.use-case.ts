import { User as UserModel } from "@/modules/user/infrastructure/model/user.model"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { ITokenService } from "@/modules/auth/application/interfaces"
import { ISubmitOnboardingUseCase } from "../interfaces/owner-usecases.interfaces"
import { IOwnerRepository } from "../../domain/repositories/owner.repository"
import { Owner } from "../../domain/entities/Owner"

export class SubmitOnboardingUseCase implements ISubmitOnboardingUseCase {
  constructor(
    private readonly ownerRepository: IOwnerRepository,
    private readonly tokenService: ITokenService
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
        userId,
        phone: userDoc.phone,
        onboardingStep: 4,
        isVerified: false,
      })
    } else {
      owner = new Owner({
        id: owner.id,
        userId,
        phone: owner.phone,
        onboardingStep: 4,
        legalFullName: owner.legalFullName,
        businessName: owner.businessName,
        gstNumber: owner.gstNumber,
        whatsapp: owner.whatsapp,
        businessEmail: owner.businessEmail,
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
