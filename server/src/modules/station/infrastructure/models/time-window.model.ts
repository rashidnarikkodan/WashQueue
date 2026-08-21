import { Schema, model, Document, Types } from "mongoose"

export interface ITimeWindowDocument extends Document {
  _id: Types.ObjectId
  id: string
  stationId: Types.ObjectId
  date: string
  windowStart: Date
  windowEnd: Date
  capacityTotal: number
  walkInReservedSlots: number
  advanceBookedCount: number
  walkInCount: number
  status: "OPEN" | "FULL" | "CLOSED" | "PAST"
  createdAt: Date
  updatedAt: Date
}

const timeWindowSchema = new Schema<ITimeWindowDocument>(
  {
    stationId: { type: Schema.Types.ObjectId, ref: "Station", required: true },
    date: { type: String, required: true },
    windowStart: { type: Date, required: true },
    windowEnd: { type: Date, required: true },
    capacityTotal: { type: Number, required: true, default: 1 },
    walkInReservedSlots: { type: Number, required: true, default: 0 },
    advanceBookedCount: { type: Number, required: true, default: 0 },
    walkInCount: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["OPEN", "FULL", "CLOSED", "PAST"],
      default: "OPEN",
    },
  },
  {
    timestamps: true,
  }
)

timeWindowSchema.index({ stationId: 1, date: 1 })

timeWindowSchema.index({ stationId: 1, windowStart: 1 }, { unique: true })

timeWindowSchema.index({ windowEnd: 1 }, { expireAfterSeconds: 86400 })

export const TimeWindowModel = model<ITimeWindowDocument>("TimeWindowInstance", timeWindowSchema)
