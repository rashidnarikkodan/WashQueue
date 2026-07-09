import { Schema, model, Document, Types } from "mongoose"

export interface IOwner extends Document {
  userId: Types.ObjectId
  legalFullName: string
  businessName: string
  businessType: "INDIVIDUAL" | "SOLE_PROP" | "PARTNERSHIP" | "PVT_LTD"
  gstNumber?: string
  whatsapp?: string
  businessEmail?: string
  hasStation: boolean
  hasMobileService: boolean
  mobileActive: boolean
  isVerified: boolean
  verifiedAt?: Date
  createdAt: Date
  updatedAt: Date
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
      required: true,
      trim: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    businessType: {
      type: String,
      enum: ["INDIVIDUAL", "SOLE_PROP", "PARTNERSHIP", "PVT_LTD"],
      required: true,
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
    hasStation: {
      type: Boolean,
      required: true,
      default: false,
    },
    hasMobileService: {
      type: Boolean,
      required: true,
      default: false,
    },
    mobileActive: {
      type: Boolean,
      required: true,
      default: false,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

export const Owner = model<IOwner>("Owner", ownerSchema)