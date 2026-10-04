export interface OnboardingDetails {
  fullName?: string
  phone?: string
  whatsapp?: string
  businessName?: string
  gstNumber?: string
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

export interface OnboardingStatus {
  step: number
  details: OnboardingDetails
  isSubmitted: boolean
}
