import { Schema, model, Document, Types } from "mongoose"

export interface IOwner extends Document {
  userId: Types.ObjectId
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
  isVerified?: boolean
  isManager?: boolean
  verifiedAt?: Date
  createdAt: Date
  updatedAt: Date

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
  transferId?: string
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
    street1: {
      type: String,
      trim: true,
    },
    street2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: "IN",
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
    transferId: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

export const Owner = model<IOwner>("Owner", ownerSchema)
