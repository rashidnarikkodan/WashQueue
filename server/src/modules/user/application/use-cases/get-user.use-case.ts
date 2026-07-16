import { IUserRepository } from "../../domain/repositories/user.repository"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { UserProfileDto } from "../dto"
import { IGetUserUseCase } from "../interfaces"
import { ROLE } from "@/common/constants/role.constants"

export class GetUserUseCase implements IGetUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly ownerRepository: IOwnerRepository
  ) {}

  async execute(id: string): Promise<UserProfileDto | null> {
    const user = await this.userRepository.findById(id)

    if (!user) {
      return null
    }

    let isVerified = user.isVerified
    let onboardingStep: number | undefined
    let onboardingDetails: Record<string, unknown> | undefined

    if (user.role === ROLE.OWNER) {
      const owner = await this.ownerRepository.findByUserId(user.id!)
      if (owner) {
        isVerified = owner.isVerified ?? false
        onboardingStep = owner.onboardingStep
        onboardingDetails = {
          fullName: owner.legalFullName,
          whatsapp: owner.whatsapp,
          businessName: owner.businessName,
          gstNumber: owner.gstNumber,
          idProofType: owner.idProofType,
          idProofUrl: owner.idProofUrl,
          businessLicenseUrl: owner.businessLicenseUrl,
          gstCertificateUrl: owner.gstCertificateUrl,
          accountHolderName: owner.accountHolderName,
          bankName: owner.bankName,
          accountNumber: owner.accountNumber,
          ifscCode: owner.ifscCode,
          bankProofUrl: owner.bankProofUrl,
        }
      }
    }

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isBlocked: user.isBlocked,
      lastLoginAt: user.lastLoginAt,
      walletBalance: user.walletBalance,
      createdAt: user.createdAt,
      authProvider: user.authProvider,
      isVerified,
      onboardingStep,
      onboardingDetails,
      updatedAt: user.updatedAt,
    }
  }
}
