interface OwnerProps {
  id?: string
  userId: string

  legalFullName?: string
  businessName?: string
  gstNumber?: string

  whatsapp?: string
  businessEmail?: string
  phone?: string

  street1?: string
  street2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string

  hasStation?: boolean
  hasMobileService?: boolean
  mobileActive?: boolean

  isVerified?: boolean
  isManager?: boolean
  verifiedAt?: Date

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

  transferId?: string

  createdAt?: Date
  updatedAt?: Date
}

export class Owner {
  constructor(private props: OwnerProps) {}

  get id(): string | undefined {
    return this.props.id
  }

  get userId(): string {
    return this.props.userId
  }

  get legalFullName(): string | undefined {
    return this.props.legalFullName
  }

  get businessName(): string | undefined {
    return this.props.businessName
  }

  get gstNumber(): string | undefined {
    return this.props.gstNumber
  }

  get whatsapp(): string | undefined {
    return this.props.whatsapp
  }

  get businessEmail(): string | undefined {
    return this.props.businessEmail
  }

  get phone(): string | undefined {
    return this.props.phone
  }

  get street1(): string | undefined {
    return this.props.street1
  }

  get street2(): string | undefined {
    return this.props.street2
  }

  get city(): string | undefined {
    return this.props.city
  }

  get state(): string | undefined {
    return this.props.state
  }

  get postalCode(): string | undefined {
    return this.props.postalCode
  }

  get country(): string | undefined {
    return this.props.country
  }

  get hasStation(): boolean {
    return this.props.hasStation ?? false
  }

  get hasMobileService(): boolean {
    return this.props.hasMobileService ?? false
  }

  get mobileActive(): boolean {
    return this.props.mobileActive ?? false
  }

  get isVerified(): boolean {
    return this.props.isVerified ?? false
  }

  get isManager(): boolean {
    return this.props.isManager ?? false
  }

  get verifiedAt(): Date | undefined {
    return this.props.verifiedAt
  }

  get onboardingStep(): number {
    return this.props.onboardingStep ?? 1
  }

  get idProofType(): string | undefined {
    return this.props.idProofType
  }

  get idProofUrl(): string | undefined {
    return this.props.idProofUrl
  }

  get businessLicenseUrl(): string | undefined {
    return this.props.businessLicenseUrl
  }

  get gstCertificateUrl(): string | undefined {
    return this.props.gstCertificateUrl
  }

  get accountHolderName(): string | undefined {
    return this.props.accountHolderName
  }

  get bankName(): string | undefined {
    return this.props.bankName
  }

  get accountNumber(): string | undefined {
    return this.props.accountNumber
  }

  get ifscCode(): string | undefined {
    return this.props.ifscCode
  }

  get bankProofUrl(): string | undefined {
    return this.props.bankProofUrl
  }

  get rejectionReason(): string | undefined {
    return this.props.rejectionReason
  }

  get transferId(): string | undefined {
    return this.props.transferId
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt
  }

  setAsManager(): void {
    this.props.isManager = true
    this.touch()
  }

  removeManagerRole(): void {
    this.props.isManager = false
    this.touch()
  }

  verify(): void {
    this.props.isVerified = true
    this.props.verifiedAt = new Date()
    this.props.rejectionReason = undefined
    this.touch()
  }

  setTransferId(transferId: string): void {
    this.props.transferId = transferId
    this.touch()
  }

  reject(reason: string): void {
    if (!reason.trim()) {
      throw new Error("Rejection reason is required")
    }

    this.props.isVerified = false
    this.props.verifiedAt = undefined
    this.props.rejectionReason = reason
    this.touch()
  }

  updateBusinessInformation(data: {
    legalFullName?: string
    businessName?: string
    gstNumber?: string
    businessEmail?: string
    phone?: string
    whatsapp?: string
    street1?: string
    street2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }): void {
    this.props.legalFullName = data.legalFullName
    this.props.businessName = data.businessName
    this.props.gstNumber = data.gstNumber
    this.props.businessEmail = data.businessEmail
    this.props.phone = data.phone
    this.props.whatsapp = data.whatsapp
    this.props.street1 = data.street1
    this.props.street2 = data.street2
    this.props.city = data.city
    this.props.state = data.state
    this.props.postalCode = data.postalCode
    this.props.country = data.country

    this.touch()
  }

  updateBankDetails(data: {
    accountHolderName: string
    bankName: string
    accountNumber: string
    ifscCode: string
  }): void {
    this.props.accountHolderName = data.accountHolderName
    this.props.bankName = data.bankName
    this.props.accountNumber = data.accountNumber
    this.props.ifscCode = data.ifscCode

    this.touch()
  }

  updateDocuments(data: {
    idProofType?: string
    idProofUrl?: string
    businessLicenseUrl?: string
    gstCertificateUrl?: string
    bankProofUrl?: string
  }): void {
    this.props.idProofType = data.idProofType
    this.props.idProofUrl = data.idProofUrl
    this.props.businessLicenseUrl = data.businessLicenseUrl
    this.props.gstCertificateUrl = data.gstCertificateUrl
    this.props.bankProofUrl = data.bankProofUrl

    this.touch()
  }

  setOnboardingStep(step: number): void {
    if (step < 1) {
      throw new Error("Invalid onboarding step")
    }

    this.props.onboardingStep = step
    this.touch()
  }

  enableStation(): void {
    this.props.hasStation = true
    this.touch()
  }

  disableStation(): void {
    this.props.hasStation = false
    this.touch()
  }

  enableMobileService(): void {
    this.props.hasMobileService = true
    this.touch()
  }

  disableMobileService(): void {
    this.props.hasMobileService = false
    this.props.mobileActive = false
    this.touch()
  }

  activateMobileService(): void {
    if (!this.props.hasMobileService) {
      throw new Error("Mobile service must be enabled before activation")
    }

    this.props.mobileActive = true
    this.touch()
  }

  deactivateMobileService(): void {
    this.props.mobileActive = false
    this.touch()
  }

  toJSON() {
    return {
      ...this.props,
      transferId: this.transferId,
      hasStation: this.hasStation,
      hasMobileService: this.hasMobileService,
      mobileActive: this.mobileActive,
      isVerified: this.isVerified,
      isManager: this.isManager,
      onboardingStep: this.onboardingStep,
    }
  }

  private touch(): void {
    this.props.updatedAt = new Date()
  }
}
