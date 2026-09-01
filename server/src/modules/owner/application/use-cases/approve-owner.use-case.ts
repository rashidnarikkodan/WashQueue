import { IOwnerRepository } from "../../domain/repositories/owner.repository"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IMailService } from "@/core/application/interfaces/mail.interface"
import { ONBOARDING_STEP } from "../../domain/constants/onboarding-step.constants"
import { NotFoundError } from "@/common/errors/not-found-error"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { Owner } from "../../domain/entities/Owner"
import { IApproveOwnerUseCase } from "../interfaces/owner-usecases.interfaces"
import { ApproveOwnerInput } from "../dto/approve-owner.dto"
import { IPaymentAccountService } from "@/core/application/interfaces/payment-account.interface"

export class ApproveOwnerUseCase implements IApproveOwnerUseCase {
  constructor(
    private readonly ownerRepository: IOwnerRepository,
    private readonly userRepository: IUserRepository,
    private readonly mailService: IMailService,
    private readonly paymentAccountService: IPaymentAccountService
  ) {}

  async execute({
    ownerIdOrUserId,
    isApproved,
    rejectionReason,
  }: ApproveOwnerInput): Promise<Owner> {
    let owner = await this.ownerRepository.findByUserId(ownerIdOrUserId)
    if (!owner) {
      owner = await this.ownerRepository.findById(ownerIdOrUserId)
    }

    if (!owner) {
      throw new NotFoundError("Owner application not found")
    }

    const user = await this.userRepository.findById(owner.userId)
    if (!user) {
      throw new NotFoundError("Associated user account not found")
    }

    const displayName = owner.legalFullName || user.name || "Owner"

    if (isApproved) {
      owner.verify()

      // Create payment account for owner on Razorpay Route if not already present
      if (!owner.transferId) {
        const legalName = owner.legalFullName?.trim() || user.name?.trim()
        if (!legalName) {
          throw new AppError(
            "Owner full name is required to create payment account",
            HTTP_STATUS.BAD_REQUEST
          )
        }

        const businessName = owner.businessName?.trim() || legalName
        const email = (owner.businessEmail || user.email)?.trim()
        if (!email) {
          throw new AppError(
            "Owner email is required to create payment account",
            HTTP_STATUS.BAD_REQUEST
          )
        }

        const phone = (owner.phone || user.phone)?.trim()
        if (!phone) {
          throw new AppError(
            "Owner phone is required to create payment account",
            HTTP_STATUS.BAD_REQUEST
          )
        }

        // Extract PAN from GST number if GST has valid 15-character format
        const gst = owner.gstNumber?.trim().toUpperCase()
        let pan: string | undefined
        if (gst && gst.length === 15) {
          pan = gst.substring(2, 12)
        }

        const transferId = await this.paymentAccountService.createAccount({
          email,
          phone,
          legal_business_name: businessName,
          business_type: gst ? "proprietorship" : "individual",
          contact_name: legalName,
          reference_id: owner.id || String(owner.userId),
          customer_facing_business_name: businessName,
          ...(gst || pan
            ? {
                legal_info: {
                  ...(gst ? { gst } : {}),
                  ...(pan ? { pan } : {}),
                },
              }
            : {}),
          notes: {
            ownerId: owner.id || "",
            userId: String(owner.userId),
          },
        })

        owner.setTransferId(transferId)
      }

      await this.ownerRepository.save(owner)
      await this.userRepository.update(owner.userId, { isVerified: true })

      try {
        await this.mailService.sendOwnerApprovalEmail(user.email, displayName)
      } catch {
        // Log mail error if any, but do not fail the transaction
      }
    } else {
      const reason =
        rejectionReason?.trim() ||
        "Please review your verification documents and business information and resubmit."

      owner.reject(reason)
      owner.setOnboardingStep(ONBOARDING_STEP.FIRST_STEP)
      await this.ownerRepository.save(owner)
      await this.userRepository.update(owner.userId, { isVerified: false })

      try {
        await this.mailService.sendOwnerRejectionEmail(user.email, displayName, reason)
      } catch {
        // Log mail error if any, but do not fail the transaction
      }
    }

    return owner
  }
}
