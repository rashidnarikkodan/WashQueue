import { Document, Model, Schema } from "mongoose"
import { SettlementStatus } from "../../domain/entities/Settlement"

export interface ISettlementDocument extends Document {
  bookingId: string
  ownerId: string
  totalAmount: number
  platformCommission: number
  stationSettlementAmount: number
  status: SettlementStatus
  createdAt: Date
  updatedAt: Date
  settledAt: Date
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
  },
  {
    timestamps: true,
  }
)


const SettlementModel = new Model('Settlement',settlementSchema)

export default SettlementModel