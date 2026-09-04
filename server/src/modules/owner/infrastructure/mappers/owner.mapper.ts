import { IOwner } from "../model/owner.model"
import { Owner } from "../../domain/entities/Owner"
import { IMapper } from "@/core/domain/repository.interface"
import { Types } from "mongoose"

export class OwnerMapper implements IMapper<Owner, IOwner> {
  static toDomain(mongooseDoc: IOwner): Owner {
    return new Owner({
      id: mongooseDoc._id.toString(),
      userId: mongooseDoc.userId.toString(),
      legalFullName: mongooseDoc.legalFullName,
      businessName: mongooseDoc.businessName,
      gstNumber: mongooseDoc.gstNumber,
      whatsapp: mongooseDoc.whatsapp,
      businessEmail: mongooseDoc.businessEmail,
      phone: mongooseDoc.phone,
      isVerified: mongooseDoc.isVerified,
      isManager: mongooseDoc.isManager,
      verifiedAt: mongooseDoc.verifiedAt,
      createdAt: mongooseDoc.createdAt,
      updatedAt: mongooseDoc.updatedAt,

      onboardingStep: mongooseDoc.onboardingStep,
      idProofType: mongooseDoc.idProofType,
      idProofUrl: mongooseDoc.idProofUrl,
      businessLicenseUrl: mongooseDoc.businessLicenseUrl,
      gstCertificateUrl: mongooseDoc.gstCertificateUrl,
      accountHolderName: mongooseDoc.accountHolderName,
      bankName: mongooseDoc.bankName,
      accountNumber: mongooseDoc.accountNumber,
      ifscCode: mongooseDoc.ifscCode,
      bankProofUrl: mongooseDoc.bankProofUrl,
      rejectionReason: mongooseDoc.rejectionReason,
      razorpayContactId: mongooseDoc.razorpayContactId,
      razorpayFundAccountId: mongooseDoc.razorpayFundAccountId,
    })
  }

  static toPersistence(domainEntity: Partial<Owner>): Partial<IOwner> {
    const raw: Partial<IOwner> = {}
    if (domainEntity.userId !== undefined) {
      raw.userId = new Types.ObjectId(domainEntity.userId)
    }
    if (domainEntity.legalFullName !== undefined) {
      raw.legalFullName = domainEntity.legalFullName
    }
    if (domainEntity.businessName !== undefined) {
      raw.businessName = domainEntity.businessName
    }
    if (domainEntity.gstNumber !== undefined) {
      raw.gstNumber = domainEntity.gstNumber
    }
    if (domainEntity.whatsapp !== undefined) {
      raw.whatsapp = domainEntity.whatsapp
    }
    if (domainEntity.businessEmail !== undefined) {
      raw.businessEmail = domainEntity.businessEmail
    }
    if (domainEntity.phone !== undefined) {
      raw.phone = domainEntity.phone
    }
    if (domainEntity.isVerified !== undefined) {
      raw.isVerified = domainEntity.isVerified
    }
    if (domainEntity.isManager !== undefined) {
      raw.isManager = domainEntity.isManager
    }
    if (domainEntity.verifiedAt !== undefined) {
      raw.verifiedAt = domainEntity.verifiedAt
    }
    if (domainEntity.onboardingStep !== undefined) {
      raw.onboardingStep = domainEntity.onboardingStep
    }
    if (domainEntity.idProofType !== undefined) {
      raw.idProofType = domainEntity.idProofType
    }
    if (domainEntity.idProofUrl !== undefined) {
      raw.idProofUrl = domainEntity.idProofUrl
    }
    if (domainEntity.businessLicenseUrl !== undefined) {
      raw.businessLicenseUrl = domainEntity.businessLicenseUrl
    }
    if (domainEntity.gstCertificateUrl !== undefined) {
      raw.gstCertificateUrl = domainEntity.gstCertificateUrl
    }
    if (domainEntity.accountHolderName !== undefined) {
      raw.accountHolderName = domainEntity.accountHolderName
    }
    if (domainEntity.bankName !== undefined) {
      raw.bankName = domainEntity.bankName
    }
    if (domainEntity.accountNumber !== undefined) {
      raw.accountNumber = domainEntity.accountNumber
    }
    if (domainEntity.ifscCode !== undefined) {
      raw.ifscCode = domainEntity.ifscCode
    }
    if (domainEntity.bankProofUrl !== undefined) {
      raw.bankProofUrl = domainEntity.bankProofUrl
    }
    if (domainEntity.rejectionReason !== undefined) {
      raw.rejectionReason = domainEntity.rejectionReason
    }
    if (domainEntity.razorpayContactId !== undefined) {
      raw.razorpayContactId = domainEntity.razorpayContactId
    }
    if (domainEntity.razorpayFundAccountId !== undefined) {
      raw.razorpayFundAccountId = domainEntity.razorpayFundAccountId
    }
    return raw
  }

  toDomain(raw: IOwner): Owner {
    return OwnerMapper.toDomain(raw)
  }

  toPersistence(entity: Partial<Owner>): Partial<IOwner> {
    return OwnerMapper.toPersistence(entity)
  }
}
