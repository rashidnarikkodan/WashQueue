import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { ITokenService } from "@/modules/auth/application/interfaces"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { ISubmitOnboardingUseCase } from "../interfaces/owner-usecases.interfaces"
import { IOwnerRepository } from "../../domain/repositories/owner.repository"
import { Owner } from "../../domain/entities/Owner"
import { ONBOARDING_STEP } from "../../domain/constants/onboarding-step.constants"
import { ROLE } from "@/common/constants/role.constants"
import { INotificationDispatcherService } from "@/modules/notification/notification.module"
import { IPayoutProvider } from "@/core/application/interfaces/payout-provider.interface"
import { ensureOwnerPayoutAccount } from "../services/ensure-owner-payout-account.service"
import logger from "@/configs/logger.config"

export class SubmitOnboardingUseCase implements ISubmitOnboardingUseCase {
  constructor(
    private readonly ownerRepository: IOwnerRepository,
    private readonly tokenService: ITokenService,
    private readonly userRepository: IUserRepository,
    private readonly payoutProvider: IPayoutProvider,
    private readonly notificationDispatcher?: INotificationDispatcherService
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

    const savedOwner = await this.ownerRepository.save(owner)
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

    const targetRole = ROLE.OWNER

    const tokenPayload = {
      userId: userDoc.id || userId,
      role: targetRole,
      email: userDoc.email,
    }

    const accessToken = this.tokenService.generateAccessToken(tokenPayload)
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload)

    await this.userRepository.update(userId, { role: targetRole, refreshToken })

    if (this.notificationDispatcher) {
      try {
        // 1. Notify Owner User
        await this.notificationDispatcher.dispatch({
          recipientId: userId,
          type: "SYSTEM",
          title: "Partner Application Submitted",
          message:
            "Your onboarding application has been submitted and is currently in review by an administrator.",
          data: {
            ownerId: savedOwner.id,
            url: "/owner/onboarding",
          },
          actionType: "NAVIGATE",
        })

        // 2. Notify Platform Admins
        await this.notificationDispatcher.dispatchToAdmins({
          type: "SYSTEM",
          title: "New Partner Application",
          message: `${savedOwner.legalFullName || userDoc.name || "A partner"} submitted an onboarding application for review.`,
          data: {
            ownerId: savedOwner.id,
            applicantName: savedOwner.legalFullName || userDoc.name,
            url: "/admin/owners",
          },
          actionType: "NAVIGATE",
        })
      } catch {
        // Non-blocking
      }
    }

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
