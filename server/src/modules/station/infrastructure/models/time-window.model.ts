import { Schema, model, Document, Types } from "mongoose"

export interface ITimeWindowDocument extends Document {
  _id: Types.ObjectId
  id: string
  stationId: Types.ObjectId
  date: string // YYYY-MM-DD
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

// Compound indexes as specified in requirements:
// 1. Querying by (stationId, date)
timeWindowSchema.index({ stationId: 1, date: 1 })

// 2. Querying by (stationId, windowStart) and UNIQUE index to prevent duplicate windows
timeWindowSchema.index({ stationId: 1, windowStart: 1 }, { unique: true })

// 3. TTL Index: Automatically delete time window documents 24 hours (86400s) after windowEnd
timeWindowSchema.index({ windowEnd: 1 }, { expireAfterSeconds: 86400 })

export const TimeWindowModel = model<ITimeWindowDocument>("TimeWindowInstance", timeWindowSchema)
