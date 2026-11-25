import { Owner } from "../../domain/entities/Owner"

export interface OwnerProfileResponseDTO {
  id: string
  userId: string
  legalFullName?: string
  businessName?: string
  gstNumber?: string
  whatsapp?: string
  businessEmail?: string
  phone?: string
  hasStation: boolean
  hasMobileService: boolean
  mobileActive: boolean
  isVerified: boolean
  isManager: boolean
  verifiedAt?: string
  onboardingStep: number
  idProofType?: string
  idProofUrl?: string
  businessLicenseUrl?: string
  gstCertificateUrl?: string
  accountHolderName?: string
  bankName?: string
  accountNumber?: string
  ifscCode?: string
  bankProofUrl?: string
  rejectionReason?: string
  createdAt?: string
  updatedAt?: string
}

export class OwnerDTOMapper {
  static toDTO(owner: Owner): OwnerProfileResponseDTO {
    return {
      id: owner.id || "",
      userId: owner.userId,
      legalFullName: owner.legalFullName,
      businessName: owner.businessName,
      gstNumber: owner.gstNumber,
      whatsapp: owner.whatsapp,
      businessEmail: owner.businessEmail,
      phone: owner.phone,
      hasStation: owner.hasStation,
      hasMobileService: owner.hasMobileService,
      mobileActive: owner.mobileActive,
      isVerified: owner.isVerified,
      isManager: owner.isManager,
      verifiedAt: owner.verifiedAt ? owner.verifiedAt.toISOString() : undefined,
      onboardingStep: owner.onboardingStep,
      idProofType: owner.idProofType,
      idProofUrl: owner.idProofUrl,
      businessLicenseUrl: owner.businessLicenseUrl,
      gstCertificateUrl: owner.gstCertificateUrl,
      accountHolderName: owner.accountHolderName,
      bankName: owner.bankName,
      accountNumber: owner.accountNumber,
      ifscCode: owner.ifscCode,
      bankProofUrl: owner.bankProofUrl,
      rejectionReason: owner.rejectionReason,
      createdAt: owner.createdAt ? owner.createdAt.toISOString() : undefined,
      updatedAt: owner.updatedAt ? owner.updatedAt.toISOString() : undefined,
    }
  }
}
