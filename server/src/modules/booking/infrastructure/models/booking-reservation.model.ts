import { Schema, model, Types } from "mongoose"

export interface IBookingReservationDocument {
  _id: Types.ObjectId
  userId: Types.ObjectId
  stationId: Types.ObjectId
  vehicleId: Types.ObjectId
  timeWindowId: Types.ObjectId
  serviceType: "HALF" | "FULL"
  extraServiceIds: string[]
  paymentType: "ONLINE_FULL" | "PAY_AT_STATION"
  depositAmount: number
  cashAmount: number
  totalAmount: number
  razorpayOrderId: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  bookingId?: Types.ObjectId
  status: "HELD" | "CONFIRMED" | "RELEASED" | "EXPIRED_REFUND_NEEDED"
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

const bookingReservationSchema = new Schema<IBookingReservationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    stationId: { type: Schema.Types.ObjectId, ref: "Station", required: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
    timeWindowId: { type: Schema.Types.ObjectId, ref: "TimeWindowInstance", required: true },
    serviceType: { type: String, enum: ["HALF", "FULL"], required: true },
    extraServiceIds: [{ type: String }],
    paymentType: { type: String, enum: ["ONLINE_FULL", "PAY_AT_STATION"], required: true },
    depositAmount: { type: Number, required: true },
    cashAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    status: {
      type: String,
      enum: ["HELD", "CONFIRMED", "RELEASED", "EXPIRED_REFUND_NEEDED"],
      default: "HELD",
      index: true,
    },
    expiresAt: { type: Date, required: true, index: true },
  },
  {
    timestamps: true,
  }
)

bookingReservationSchema.index({ status: 1, expiresAt: 1 })

export const BookingReservationModel = model<IBookingReservationDocument>(
  "BookingReservation",
  bookingReservationSchema
)
