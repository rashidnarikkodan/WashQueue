import mongoose, { Schema, Document } from "mongoose"

export interface IWalletDocument extends Document {
  userId: mongoose.Types.ObjectId
  balance: number
  currency: string
  status: "ACTIVE" | "SUSPENDED" | "LOCKED"
  createdAt: Date
  updatedAt: Date
}

const WalletSchema = new Schema<IWalletDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Wallet balance cannot be negative"],
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "LOCKED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
)

export const WalletModel = mongoose.model<IWalletDocument>("Wallet", WalletSchema)
