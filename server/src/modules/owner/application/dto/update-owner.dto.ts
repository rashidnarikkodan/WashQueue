export interface UpdateOwnerInput {
  legalFullName?: string
  businessName?: string
  businessType?: "INDIVIDUAL" | "SOLE_PROP" | "PARTNERSHIP" | "PVT_LTD"
  gstNumber?: string
  whatsapp?: string
  businessEmail?: string
  isVerified?: boolean
}
