import { IOwnerRepository } from "../../domain/repositories/owner.repository"
import { Owner } from "../../domain/entities/Owner"
import { ProviderProfile } from "../models/owner.model"
import { User as UserModel } from "@/modules/user/infrastructure/models/user.model"
import { UserMapper } from "@/modules/user/infrastructure/mappers/user.mapper"

export class MongooseOwnerRepository implements IOwnerRepository {
  async findByUserId(userId: string): Promise<Owner | null> {
    const userDoc = await UserModel.findById(userId).lean().exec()
    if (!userDoc) return null

    const profile = await ProviderProfile.findOne({ userId }).lean().exec()
    if (!profile) return null

    return UserMapper.toDomain({
      ...userDoc,
      isVerified: profile.isVerified,
      onboardingStep: profile.onboardingStep,
      legalFullName: profile.legalFullName,
      businessName: profile.businessName,
      businessType: profile.businessType,
      gstNumber: profile.gstNumber,
      whatsapp: profile.whatsapp,
      businessEmail: profile.businessEmail,
      hasStation: profile.hasStation,
      hasMobileService: profile.hasMobileService,
      mobileActive: profile.mobileActive,
      idProofType: profile.idProofType,
      idProofUrl: profile.idProofUrl,
      businessLicenseUrl: profile.businessLicenseUrl,
      gstCertificateUrl: profile.gstCertificateUrl,
      accountHolderName: profile.accountHolderName,
      bankName: profile.bankName,
      accountNumber: profile.accountNumber,
      ifscCode: profile.ifscCode,
      accountType: profile.accountType,
      bankProofUrl: profile.bankProofUrl,
    } as any) as Owner
  }

  async save(owner: Owner): Promise<Owner> {
    const profileUpdates = {
      onboardingStep: owner.onboardingStep,
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
      verifiedAt: owner.isVerified ? (owner.verifiedAt ?? new Date()) : undefined,
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
    }

    const profile = await ProviderProfile.findOneAndUpdate(
      { userId: owner.id as any },
      { $set: profileUpdates },
      { upsert: true, new: true }
    ).lean().exec()

    const userDoc = await UserModel.findById(owner.id).lean().exec()

    return UserMapper.toDomain({
      ...userDoc,
      isVerified: profile.isVerified,
      onboardingStep: profile.onboardingStep,
      legalFullName: profile.legalFullName,
      businessName: profile.businessName,
      businessType: profile.businessType,
      gstNumber: profile.gstNumber,
      whatsapp: profile.whatsapp,
      businessEmail: profile.businessEmail,
      hasStation: profile.hasStation,
      hasMobileService: profile.hasMobileService,
      mobileActive: profile.mobileActive,
      idProofType: profile.idProofType,
      idProofUrl: profile.idProofUrl,
      businessLicenseUrl: profile.businessLicenseUrl,
      gstCertificateUrl: profile.gstCertificateUrl,
      accountHolderName: profile.accountHolderName,
      bankName: profile.bankName,
      accountNumber: profile.accountNumber,
      ifscCode: profile.ifscCode,
      accountType: profile.accountType,
      bankProofUrl: profile.bankProofUrl,
    } as any) as Owner
  }
}
