import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { ITokenService } from "@/modules/auth/application/interfaces"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { ISubmitOnboardingUseCase } from "../interfaces/owner-usecases.interfaces"
import { IOwnerRepository } from "../../domain/repositories/owner.repository"
import { Owner } from "../../domain/entities/Owner"

export class SubmitOnboardingUseCase implements ISubmitOnboardingUseCase {
  constructor(
    private readonly ownerRepository: IOwnerRepository,
    private readonly tokenService: ITokenService,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(userId: string): Promise<{
    success: boolean
    message: string
    tokens: { accessToken: string; refreshToken: string }
  }> {
    const userDoc = await this.userRepository.findById(userId)
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
      userId: userDoc.id || userId,
      role: userDoc.role,
      email: userDoc.email,
      ...(owner.id ? { ownerId: owner.id } : {}),
    }

    const accessToken = this.tokenService.generateAccessToken(tokenPayload)
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload)

    await this.userRepository.update(userId, { refreshToken })

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
