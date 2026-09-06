import { Schema, model, Document, Types } from "mongoose"

export interface IBookingStatusLogDocument extends Document {
  _id: Types.ObjectId
  bookingId: Types.ObjectId
  fromStatus?: string | null
  toStatus: string
  changedBy: Types.ObjectId
  reason?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const bookingStatusLogSchema = new Schema<IBookingStatusLogDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    fromStatus: { type: String, default: null },
    toStatus: { type: String, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
)

export const BookingStatusLogModel = model<IBookingStatusLogDocument>(
  "BookingStatusLog",
  bookingStatusLogSchema
)
