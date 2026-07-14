import { User, UserProps } from "../../../user/domain/entities/User"

export interface OwnerProps extends UserProps {
  onboardingStep?: number
  
  // Business Info
  legalFullName?: string
  businessName?: string
  businessType?: string
  gstNumber?: string

  // Contact
  whatsapp?: string
  businessEmail?: string

  // Capabilities
  hasStation?: boolean
  hasMobileService?: boolean
  mobileActive?: boolean

  // Verification Status
  isVerified?: boolean
  verifiedAt?: Date

  // Documents KYC
  idProofType?: string
  idProofUrl?: string
  businessLicenseUrl?: string
  gstCertificateUrl?: string

  // Payout Details
  accountHolderName?: string
  bankName?: string
  accountNumber?: string
  ifscCode?: string
  accountType?: string
  bankProofUrl?: string
}

export class Owner extends User {
  readonly onboardingStep: number
  
  // Business Info
  readonly legalFullName?: string
  readonly businessName?: string
  readonly businessType?: string
  readonly gstNumber?: string

  // Contact
  readonly whatsapp?: string
  readonly businessEmail?: string

  // Capabilities
  readonly hasStation: boolean
  readonly hasMobileService: boolean
  readonly mobileActive: boolean

  // Verification Status
  readonly isVerified: boolean
  readonly verifiedAt?: Date

  // Documents KYC
  readonly idProofType?: string
  readonly idProofUrl?: string
  readonly businessLicenseUrl?: string
  readonly gstCertificateUrl?: string

  // Payout Details
  readonly accountHolderName?: string
  readonly bankName?: string
  readonly accountNumber?: string
  readonly ifscCode?: string
  readonly accountType?: string
  readonly bankProofUrl?: string

  constructor(props: OwnerProps) {
    super(props)
    this.onboardingStep = props.onboardingStep ?? 1
    
    this.legalFullName = props.legalFullName
    this.businessName = props.businessName
    this.businessType = props.businessType
    this.gstNumber = props.gstNumber

    this.whatsapp = props.whatsapp
    this.businessEmail = props.businessEmail

    this.hasStation = props.hasStation ?? false
    this.hasMobileService = props.hasMobileService ?? false
    this.mobileActive = props.mobileActive ?? false

    this.isVerified = props.isVerified ?? false
    this.verifiedAt = props.verifiedAt

    this.idProofType = props.idProofType
    this.idProofUrl = props.idProofUrl
    this.businessLicenseUrl = props.businessLicenseUrl
    this.gstCertificateUrl = props.gstCertificateUrl

    this.accountHolderName = props.accountHolderName
    this.bankName = props.bankName
    this.accountNumber = props.accountNumber
    this.ifscCode = props.ifscCode
    this.accountType = props.accountType
    this.bankProofUrl = props.bankProofUrl
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      role: this.role,
      refreshToken: this.refreshToken,
      lastLoginAt: this.lastLoginAt,
      walletBalance: this.walletBalance,
      avatar: this.avatar,
      authProvider: this.authProvider,
      isBlocked: this.isBlocked,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isVerified: this.isVerified,
      onboardingStep: this.onboardingStep,
      onboardingDetails: {
        fullName: this.legalFullName,
        phone: this.phone,
        whatsapp: this.whatsapp,
        businessName: this.businessName,
        businessType: this.businessType,
        gstNumber: this.gstNumber,
        idProofType: this.idProofType,
        idProofUrl: this.idProofUrl,
        businessLicenseUrl: this.businessLicenseUrl,
        gstCertificateUrl: this.gstCertificateUrl,
        accountHolderName: this.accountHolderName,
        bankName: this.bankName,
        accountNumber: this.accountNumber,
        ifscCode: this.ifscCode,
        accountType: this.accountType,
        bankProofUrl: this.bankProofUrl,
        hasStation: this.hasStation,
        hasMobileService: this.hasMobileService,
        mobileActive: this.mobileActive,
      }
    }
  }
}
