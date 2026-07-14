export interface UpdateOwnerInput {
  legalFullName?: string
  businessName?: string
  businessType?: "INDIVIDUAL" | "SOLE_PROP" | "PARTNERSHIP" | "PVT_LTD"
  gstNumber?: string
  whatsapp?: string
  businessEmail?: string
  hasStation?: boolean
  hasMobileService?: boolean
  mobileActive?: boolean
  isVerified?: boolean
}
