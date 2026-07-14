import { IUserRepository } from "../../domain/repositories/user.repository"
import { User } from "../../domain/entities/User"
import { UpdateUserInput } from "../dto/update-user.dto"
import { IUpdateUserUseCase } from "../interfaces/user-usecases.interfaces"
import { ICacheService } from "@/core/application/cache.interface"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { Owner } from "@/modules/owner/domain/entities/Owner"

const BLOCKED_USER_TTL_SECONDS = 30 * 24 * 60 * 60 // 30 days

export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly cacheService: ICacheService,
    private readonly ownerRepository: IOwnerRepository,
  ) { }

  async execute(id: string, updates: UpdateUserInput): Promise<User | null> {
    const user = await this.userRepository.findById(id)
    if (!user) return null

    const updatedUser = await this.userRepository.update(id, updates)

    if (updatedUser && typeof updates.isBlocked === "boolean") {
      const key = `blocked:${id}`
      if (updates.isBlocked) {
        // Blacklist user session. Set TTL to 30 days.
        await this.cacheService.set(key, "true", BLOCKED_USER_TTL_SECONDS)
      } else {
        await this.cacheService.del(key)
      }
    }

    if (user.role === "owner") {
      const owner = await this.ownerRepository.findByUserId(id)
      if (owner) {
        const updatedOwner = new Owner({
          userId: id,
          phone: updates.phone !== undefined ? updates.phone : owner.phone,
          onboardingStep: updates.onboardingStep !== undefined ? updates.onboardingStep : owner.onboardingStep,
          isVerified: updates.isVerified !== undefined ? updates.isVerified : owner.isVerified,
          verifiedAt: updates.isVerified ? new Date() : owner.verifiedAt,
          legalFullName: owner.legalFullName,
          businessName: owner.businessName,
          businessType: owner.businessType,
          gstNumber: owner.gstNumber,
          whatsapp: owner.whatsapp,
          businessEmail: owner.businessEmail,
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
        await this.ownerRepository.save(updatedOwner)
      }
    }

    return updatedUser
  }
}
