import { Schema, model, Document, Types } from "mongoose"

export interface IStation extends Document {
  ownerId: Types.ObjectId
  name: string
  description?: string
  contactPhone: string
  contactEmail: string

  location?: {
    type: "Point"
    coordinates: [number, number]
  }
  address?: string
  pincode?: string
  city?: string
  state?: string

  images?: Array<{
    url: string
    publicId: string
    isPrimary: boolean
  }>

  bays?: number
  avgServiceTime?: number

  operatingHours?: Array<{
    day: string
    open: string
    close: string
    isClosed: boolean
  }>
  holidays?: Array<{
    date: Date
    reason: string
  }>
  amenities?: string[]

  rating: number
  reviewCount: number

  verifiedAt?: Date | null
  rejectionReason?: string | null

  status: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const stationSchema = new Schema<IStation>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
    address: {
      type: String,
      trim: true,
    },
    pincode: {
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
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    bays: {
      type: Number,
      min: 1,
    },
    avgServiceTime: {
      type: Number,
      min: 1,
    },
    operatingHours: [
      {
        day: {
          type: String,
          enum: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
          required: true,
        },
        open: { type: String, required: true }, // HH:mm
        close: { type: String, required: true }, // HH:mm
        isClosed: { type: Boolean, default: false },
      },
    ],
    holidays: [
      {
        date: { type: Date, required: true },
        reason: { type: String, required: true },
      },
    ],
    amenities: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["DRAFT", "PENDING_REVIEW", "PENDING_APPROVAL", "ACTIVE", "INACTIVE", "SUSPENDED", "REJECTED"],
      default: "DRAFT",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

stationSchema.index({ location: "2dsphere" })

export const StationModel = model<IStation>("Station", stationSchema)
