import { Document, model, Schema } from "mongoose"
import { SettlementStatus } from "../../domain/entities/Settlement"

export interface ISettlementDocument extends Document {
  bookingId: string
  ownerId: string
  totalAmount: number
  platformCommission: number
  stationSettlementAmount: number
  status: SettlementStatus
  transferId?: string
  settledAt?: Date
  createdAt: Date
  updatedAt: Date
}

const settlementSchema = new Schema<ISettlementDocument>(
  {
    bookingId: {
      type: String,
      required: true,
      index: true,
    },

    ownerId: {
      type: String,
      required: true,
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

    stationSettlementAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: Object.values(SettlementStatus),
      required: true,
      index: true,
    },

    transferId: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },

    settledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

export const SettlementModel = model<ISettlementDocument>("Settlement", settlementSchema)

export default SettlementModel