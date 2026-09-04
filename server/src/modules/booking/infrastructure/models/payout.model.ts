import { Document, model, Schema, Types } from "mongoose"
import { PayoutStatus, PAYOUT_PROVIDER_RAZORPAY_X } from "../../domain/entities/Payout"

export interface IPayoutDocument extends Document {
  settlementId: Types.ObjectId
  ownerId: Types.ObjectId
  provider: typeof PAYOUT_PROVIDER_RAZORPAY_X
  razorpayPayoutId?: string
  amount: number
  currency: string
  status: PayoutStatus
  idempotencyKey: string
  failureReason?: string
  processedAt?: Date
  failedAt?: Date
  reversedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const payoutSchema = new Schema<IPayoutDocument>(
  {
    settlementId: {
      type: Schema.Types.ObjectId,
      ref: "Settlement",
      required: true,
      unique: true,
      index: true,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
      index: true,
    },

    provider: {
      type: String,
      enum: [PAYOUT_PROVIDER_RAZORPAY_X],
      required: true,
      default: PAYOUT_PROVIDER_RAZORPAY_X,
    },

    razorpayPayoutId: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },

    amount: {
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
      enum: Object.values(PayoutStatus),
      default: PayoutStatus.PENDING,
      required: true,
      index: true,
    },

    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    failureReason: {
      type: String,
      trim: true,
    },

    processedAt: { type: Date },
    failedAt: { type: Date },
    reversedAt: { type: Date },
  },
  {
    timestamps: true,
  }
)

payoutSchema.index({ ownerId: 1, status: 1, createdAt: -1 })

export const PayoutModel = model<IPayoutDocument>("Payout", payoutSchema)

export default PayoutModel
