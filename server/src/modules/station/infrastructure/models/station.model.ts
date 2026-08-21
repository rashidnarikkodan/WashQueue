import { Schema, model, Document, Types } from "mongoose"
import { StationStatus } from "../../domain/entities/Station"

interface IGeoPoint {
  type: "Point"
  coordinates: [number, number]
}

interface IStationContact {
  phone: string
  email: string
}

interface IStationAddress {
  street: string
  city: string
  state: string
  country: string
  pincode: string
}

interface IStationImage {
  url: string
  publicId: string
  isPrimary: boolean
}

interface IOperatingHour {
  day: string
  open: string
  close: string
  isClosed: boolean
}

interface IHoliday {
  date: Date
  reason?: string
}

interface ISlotConfig {
  bays: number
  windowDurationMins: number
  capacityPerWindow: number
  walkInReservedSlots: number
  maxAdvanceBookingDays: number
  allowWalkIns: boolean
}

export interface IStation extends Document {
  ownerId: Types.ObjectId
  managerId?: Types.ObjectId | null

  name: string
  description: string

  contact: IStationContact

  location: IGeoPoint
  address: IStationAddress

  images: IStationImage[]

  operatingHours: IOperatingHour[]
  holidays: IHoliday[]

  slotConfig: ISlotConfig

  amenities: string[]

  rating: number
  reviewCount: number

  verifiedAt?: Date
  rejectionReason?: string

  status: string
  isActive: boolean

  createdAt: Date
  updatedAt: Date
}

const stationSchema = new Schema<IStation>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    managerId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },

    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },

    contact: {
      phone: { type: String, default: "" },
      email: { type: String, default: "", lowercase: true, trim: true },
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number], default: [0, 0] },
    },

    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },

    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
      },
    ],

    operatingHours: [
      {
        day: { type: String, required: true },
        open: { type: String, required: true },
        close: { type: String, required: true },
        isClosed: { type: Boolean, default: false },
      },
    ],

    holidays: [
      {
        date: { type: Date, required: true },
        reason: { type: String },
      },
    ],

    slotConfig: {
      bays: { type: Number, default: 0 },
      windowDurationMins: { type: Number, default: 0 },
      capacityPerWindow: { type: Number, default: 0 },
      walkInReservedSlots: { type: Number, default: 0 },
      maxAdvanceBookingDays: { type: Number, default: 0 },
      allowWalkIns: { type: Boolean, default: false },
    },

    amenities: [{ type: String }],

    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    verifiedAt: { type: Date },
    rejectionReason: { type: String },

    status: {
      type: String,
      enum: Object.values(StationStatus),
      default: StationStatus.DRAFT,
    },

    isActive: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "stations" }
)

stationSchema.index({ location: "2dsphere" })

export const StationModel = model<IStation>("Station", stationSchema)
