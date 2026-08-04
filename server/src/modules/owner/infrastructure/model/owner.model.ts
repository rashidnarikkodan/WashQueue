import { Schema, model, Document, Types } from "mongoose"

export interface IOwner extends Document {
  userId: Types.ObjectId
  legalFullName?: string
  businessName?: string
  gstNumber?: string
  whatsapp?: string
  businessEmail?: string
  phone?: string
  isVerified?: boolean
  isManager?: boolean
  verifiedAt?: Date
  createdAt: Date
  updatedAt: Date

  // onboarding fields
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
}

const ownerSchema = new Schema<IOwner>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    legalFullName: {
      type: String,
      trim: true,
    },
    businessName: {
      type: String,
      trim: true,
    },
    gstNumber: {
      type: String,
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    businessEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isManager: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
    onboardingStep: {
      type: Number,
      required: true,
      default: 1,
    },
    idProofType: { type: String },
    idProofUrl: { type: String },
    businessLicenseUrl: { type: String },
    gstCertificateUrl: { type: String },
    accountHolderName: { type: String },
    bankName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    bankProofUrl: { type: String },
    rejectionReason: { type: String },
  },
  {
    timestamps: true,
  }
)

export const Owner = model<IOwner>("Owner", ownerSchema)
