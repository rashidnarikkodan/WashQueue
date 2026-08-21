import mongoose, { Schema, Document } from "mongoose"

export interface IWalletTransactionDocument extends Document {
  walletId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  type: "CREDIT" | "DEBIT" | "REFUND"
  category: "TOP_UP" | "BOOKING_PAYMENT" | "REFUND" | "CASHBACK" | "ADMIN_ADJUSTMENT"
  amount: number
  balanceBefore: number
  balanceAfter: number
  referenceId?: string
  description: string
  status: "COMPLETED" | "PENDING" | "FAILED"
  metadata?: Record<string, unknown>
  createdAt: Date
}

const WalletTransactionSchema = new Schema<IWalletTransactionDocument>(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["CREDIT", "DEBIT", "REFUND"],
      required: true,
    },
    category: {
      type: String,
      enum: ["TOP_UP", "BOOKING_PAYMENT", "REFUND", "CASHBACK", "ADMIN_ADJUSTMENT"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Transaction amount cannot be negative"],
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    referenceId: {
      type: String,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["COMPLETED", "PENDING", "FAILED"],
      default: "COMPLETED",
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

WalletTransactionSchema.index({ userId: 1, createdAt: -1 })
WalletTransactionSchema.index({ walletId: 1, createdAt: -1 })

WalletTransactionSchema.index(
  { userId: 1, referenceId: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: { referenceId: { $exists: true, $type: "string" }, status: "COMPLETED" },
  }
)

export const WalletTransactionModel = mongoose.model<IWalletTransactionDocument>(
  "WalletTransaction",
  WalletTransactionSchema
)
