import { Document, model, Schema } from "mongoose"
import { SettlementStatus } from "../../domain/entities/Settlement"

export interface ISettlementDocument extends Document {
  bookingId: string
  ownerId: string
  stationId?: string
  totalAmount: number
  platformCommission: number
  platformCommissionRate?: number
  stationSettlementAmount: number
  currency: string
  status: SettlementStatus
  transferId?: string
  holdReason?: string
  failureReason?: string
  retryCount: number
  lastRetriedAt?: Date
  settledAt?: Date
  createdAt: Date
  updatedAt: Date
}

const settlementSchema = new Schema<ISettlementDocument>(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    ownerId: {
      type: String,
      required: true,
      index: true,
    },

    stationId: {
      type: String,
      index: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    platformCommission: {
      type: Number,
      required: true,
      min: 0,
    },

    platformCommissionRate: {
      type: Number,
      min: 0,
      max: 1,
    },

    stationSettlementAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: Object.values(SettlementStatus),
      default: SettlementStatus.PENDING,
      required: true,
      index: true,
    },

    transferId: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },

    holdReason: {
      type: String,
      trim: true,
    },

    failureReason: {
      type: String,
      trim: true,
    },

    retryCount: {
      type: Number,
      default: 0,
    },

    lastRetriedAt: {
      type: Date,
    },

    settledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

settlementSchema.index({ ownerId: 1, status: 1, createdAt: -1 })
settlementSchema.index({ status: 1, createdAt: -1 })
settlementSchema.index({ stationId: 1, status: 1 })

export const SettlementModel = model<ISettlementDocument>("Settlement", settlementSchema)

export default SettlementModel