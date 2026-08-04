export interface OwnerProps {
  id?: string
  userId: string
  legalFullName?: string
  businessName?: string
  gstNumber?: string
  whatsapp?: string
  businessEmail?: string
  phone?: string
  isVerified?: boolean
  isManager?: boolean
  verifiedAt?: Date
  createdAt?: Date
  updatedAt?: Date

  // onboarding fields
  onboardingStep?: number
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
}

export class Owner implements OwnerProps {
  readonly id?: string
  readonly userId: string
  readonly legalFullName?: string
  readonly businessName?: string
  readonly gstNumber?: string
  readonly whatsapp?: string
  readonly businessEmail?: string
  readonly phone?: string
  readonly hasStation?: boolean
  readonly hasMobileService?: boolean
  readonly mobileActive?: boolean
  readonly isVerified?: boolean
  readonly isManager?: boolean
  readonly verifiedAt?: Date
  readonly createdAt?: Date
  readonly updatedAt?: Date

  // onboarding fields
  readonly onboardingStep?: number
  readonly idProofType?: string
  readonly idProofUrl?: string
  readonly businessLicenseUrl?: string
  readonly gstCertificateUrl?: string
  readonly accountHolderName?: string
  readonly bankName?: string
  readonly accountNumber?: string
  readonly ifscCode?: string
  readonly bankProofUrl?: string
  readonly rejectionReason?: string

  constructor(props: OwnerProps) {
    this.id = props.id
    this.userId = props.userId
    this.legalFullName = props.legalFullName
    this.businessName = props.businessName
    this.gstNumber = props.gstNumber
    this.whatsapp = props.whatsapp
    this.businessEmail = props.businessEmail
    this.phone = props.phone
    this.isVerified = props.isVerified ?? false
    this.isManager = props.isManager ?? false
    this.verifiedAt = props.verifiedAt
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt

    this.onboardingStep = props.onboardingStep ?? 1
    this.idProofType = props.idProofType
    this.idProofUrl = props.idProofUrl
    this.businessLicenseUrl = props.businessLicenseUrl
    this.gstCertificateUrl = props.gstCertificateUrl
    this.accountHolderName = props.accountHolderName
    this.bankName = props.bankName
    this.accountNumber = props.accountNumber
    this.ifscCode = props.ifscCode
    this.bankProofUrl = props.bankProofUrl
    this.rejectionReason = props.rejectionReason
  }
}
