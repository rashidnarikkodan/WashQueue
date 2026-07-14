import { IUserRepository } from "../../domain/repositories/user.repository";
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository";
import redis from "@/infrastructure/redis/redis.client";
import { Owner } from "@/modules/owner/domain/entities/Owner";

export class UpdateUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly ownerRepository: IOwnerRepository,
  ) {}

  async execute(id: string, updates: { isBlocked?: boolean; name?: string; email?: string; phone?: string; isVerified?: boolean; onboardingStep?: number }) {
    const user = await this.userRepository.findById(id);
    if (!user) return null;

    // Separate updates for User
    const userUpdates: any = {};
    if (updates.name !== undefined) userUpdates.name = updates.name;
    if (updates.email !== undefined) userUpdates.email = updates.email;
    if (updates.phone !== undefined) userUpdates.phone = updates.phone;
    if (updates.isBlocked !== undefined) userUpdates.isBlocked = updates.isBlocked;

    const updatedUser = await this.userRepository.update(id, userUpdates);
    
    if (updatedUser && typeof updates.isBlocked === "boolean") {
      const key = `blocked:${id}`;
      if (updates.isBlocked) {
        // Blacklist user session. Set TTL to 30 days.
        await redis.set(key, "true", "EX", 30 * 24 * 60 * 60);
      } else {
        await redis.del(key);
      }
    }

    if (user.role === "owner") {
      const owner = await this.ownerRepository.findByUserId(id);
      if (owner) {
        const ownerUpdates: any = {
          id,
          name: updatedUser?.name ?? user.name,
          email: updatedUser?.email ?? user.email,
          phone: updatedUser?.phone ?? user.phone,
          role: "owner",
          isBlocked: updatedUser?.isBlocked ?? user.isBlocked,
          createdAt: updatedUser?.createdAt ?? user.createdAt,
          updatedAt: updatedUser?.updatedAt ?? user.updatedAt,
          
          isVerified: updates.isVerified !== undefined ? updates.isVerified : owner.isVerified,
          verifiedAt: updates.isVerified ? new Date() : owner.verifiedAt,
          onboardingStep: updates.onboardingStep !== undefined ? updates.onboardingStep : owner.onboardingStep,
          legalFullName: owner.legalFullName,
          businessName: owner.businessName,
          businessType: owner.businessType,
          gstNumber: owner.gstNumber,
          whatsapp: owner.whatsapp,
          businessEmail: owner.businessEmail,
          hasStation: owner.hasStation,
          hasMobileService: owner.hasMobileService,
          mobileActive: owner.mobileActive,
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
        };
        const savedOwner = await this.ownerRepository.save(new Owner(ownerUpdates));
        return savedOwner;
      }
    }
    
    return updatedUser;
  }
}
