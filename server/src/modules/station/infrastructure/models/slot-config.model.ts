import { Schema, model, Document, Types } from "mongoose"

export interface ISlotConfigDocument extends Document {
  _id: Types.ObjectId
  id: string
  stationId: Types.ObjectId
  windowDurationMins: number
  capacityPerWindow: number
  walkInReservedSlots: number
  maxAdvanceBookingDays: number
  allowWalkIns: boolean
  createdAt: Date
  updatedAt: Date
}

const slotConfigSchema = new Schema<ISlotConfigDocument>(
  {
    stationId: { type: Schema.Types.ObjectId, ref: "Station", required: true, unique: true },
    windowDurationMins: { type: Number, required: true, default: 30 },
    capacityPerWindow: { type: Number, required: true, default: 1 },
    walkInReservedSlots: { type: Number, required: true, default: 0 },
    maxAdvanceBookingDays: { type: Number, required: true, default: 7 },
    allowWalkIns: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  }
)

export const SlotConfigModel = model<ISlotConfigDocument>("SlotConfig", slotConfigSchema)
