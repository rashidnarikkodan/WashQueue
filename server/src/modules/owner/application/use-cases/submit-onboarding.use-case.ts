import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { ITokenService } from "@/modules/auth/application/interfaces"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { ISubmitOnboardingUseCase } from "../interfaces/owner-usecases.interfaces"
import { IOwnerRepository } from "../../domain/repositories/owner.repository"
import { Owner } from "../../domain/entities/Owner"
import { ONBOARDING_STEP } from "../../domain/constants/onboarding-step.constants"
import { IPayoutProvider } from "@/core/application/interfaces/payout-provider.interface"
import { ensureOwnerPayoutAccount } from "../services/ensure-owner-payout-account.service"
import logger from "@/configs/logger.config"

export class SubmitOnboardingUseCase implements ISubmitOnboardingUseCase {
  constructor(
    private readonly ownerRepository: IOwnerRepository,
    private readonly tokenService: ITokenService,
    private readonly userRepository: IUserRepository,
    private readonly payoutProvider: IPayoutProvider
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
        onboardingStep: ONBOARDING_STEP.IN_REVIEW,
        isVerified: false,
      })
    } else {
      owner = new Owner({
        id: owner.id,
        userId,
        phone: owner.phone,
        onboardingStep: ONBOARDING_STEP.IN_REVIEW,
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

    // Attempt to create the owner's RazorpayX payout destination now, while they're present to
    // fix a bad IFSC/account number immediately — rather than waiting until admin approval days
    // later. Not fatal here: ApproveOwnerUseCase still hard-requires it before final approval,
    // and ProcessSettlementUseCase has its own lazy fallback — this is just the earliest attempt.
    try {
      await ensureOwnerPayoutAccount(
        owner,
        this.payoutProvider,
        userDoc.name,
        userDoc.email,
        userDoc.phone
      )
    } catch (err: unknown) {
      logger.warn(
        { err, ownerId: owner.id },
        "Failed to create RazorpayX payout destination during onboarding submission; will retry at approval time"
      )
    }

    await this.ownerRepository.save(owner)

    const tokenPayload = {
      userId: userDoc.id || userId,
      role: userDoc.role,
      email: userDoc.email,
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
