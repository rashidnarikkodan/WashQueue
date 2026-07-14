import { Schema, model, Document } from "mongoose"

export interface IProviderProfile extends Document {
  userId: Schema.Types.ObjectId | string
  
  // Business Info
  legalFullName?: string
  businessName?: string
  businessType?: string
  gstNumber?: string

  // Contact
  whatsapp?: string
  businessEmail?: string

  // Capabilities
  hasStation: boolean
  hasMobileService: boolean
  mobileActive: boolean

  // Verification Status
  isVerified: boolean
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

  // Onboarding Step state
  onboardingStep: number

  createdAt: Date
  updatedAt: Date
}

const providerProfileSchema = new Schema<IProviderProfile>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  
  // Business Info
  legalFullName: { type: String },
  businessName: { type: String },
  businessType: { type: String },
  gstNumber: { type: String },

  // Contact
  whatsapp: { type: String },
  businessEmail: { type: String },

  // Capabilities
  hasStation: { type: Boolean, default: false },
  hasMobileService: { type: Boolean, default: false },
  mobileActive: { type: Boolean, default: false },

  // Verification Status
  isVerified: { type: Boolean, default: false },
  verifiedAt: { type: Date },

  // Documents KYC
  idProofType: { type: String },
  idProofUrl: { type: String },
  businessLicenseUrl: { type: String },
  gstCertificateUrl: { type: String },

  // Payout Details
  accountHolderName: { type: String },
  bankName: { type: String },
  accountNumber: { type: String },
  ifscCode: { type: String },
  accountType: { type: String },
  bankProofUrl: { type: String },

  // Onboarding Step
  onboardingStep: { type: Number, default: 1 },
}, {
  timestamps: true,
  collection: "provider_profiles"
})

export const ProviderProfile = model<IProviderProfile>("ProviderProfile", providerProfileSchema)
