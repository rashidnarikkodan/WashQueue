import { Schema, model, Document, Types } from "mongoose"

export interface IReview extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  ownerId: Types.ObjectId
  stationId: Types.ObjectId
  bookingId: Types.ObjectId
  rating: number
  comment: string
  update_count: number
  isVisible: boolean
  report_count: number
  flags: string[]
  createdAt: Date
  updatedAt: Date
}

const reviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    stationId: { type: Schema.Types.ObjectId, ref: "Station", required: true, index: true },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
      index: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", trim: true },
    update_count: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true, index: true },
    report_count: { type: Number, default: 0, index: true },
    flags: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
)

reviewSchema.index({ stationId: 1, isVisible: 1, createdAt: -1 })
reviewSchema.index({ userId: 1, createdAt: -1 })
reviewSchema.index({ ownerId: 1, createdAt: -1 })
reviewSchema.index({ report_count: -1 })

export const ReviewModel = model<IReview>("Review", reviewSchema)
