export interface IOwnerOnboardingDetails {
  fullName?: string
  phone?: string
  whatsapp?: string
  businessName?: string
  businessType?: string
  gstNumber?: string
  idProofType?: string
  idProofUrl?: string
  businessLicenseUrl?: string
  gstCertificateUrl?: string
  accountHolderName?: string
  bankName?: string
  accountNumber?: string
  ifscCode?: string
  accountType?: string
  bankProofUrl?: string
  businessEmail?: string
  hasStation?: boolean
  hasMobileService?: boolean
  mobileActive?: boolean
}

export interface ISaveOnboardingStepUseCase {
  execute(
    userId: string,
    step: number,
    details: IOwnerOnboardingDetails
  ): Promise<{
    step: number
    details: IOwnerOnboardingDetails
    isSubmitted: boolean
    tokens?: { accessToken: string; refreshToken: string }
  }>
}

export interface IGetOnboardingStatusUseCase {
  execute(userId: string): Promise<{
    step: number
    details: IOwnerOnboardingDetails
    isSubmitted: boolean
  }>
}

export interface ISubmitOnboardingUseCase {
  execute(userId: string): Promise<{
    success: boolean
    message: string
    tokens: { accessToken: string; refreshToken: string }
  }>
}
