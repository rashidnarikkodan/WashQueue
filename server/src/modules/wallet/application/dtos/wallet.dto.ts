import {
  TransactionType,
  TransactionCategory,
  TransactionStatus,
} from "../../domain/entities/wallet-transaction.entity"
import { WalletStatus } from "../../domain/entities/wallet.entity"

export interface WalletDTO {
  id: string
  userId: string
  balance: number
  currency: string
  status: WalletStatus
  createdAt: string
  updatedAt: string
}

export interface WalletTransactionDTO {
  id: string
  walletId: string
  userId: string
  type: TransactionType
  category: TransactionCategory
  amount: number
  balanceBefore: number
  balanceAfter: number
  referenceId?: string
  description: string
  status: TransactionStatus
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface TopUpOrderDTO {
  orderId: string
  amount: number
  currency: string
  receipt: string
  keyId?: string
}

export interface VerifyTopUpPaymentDTO {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export interface PayWithWalletInputDTO {
  userId: string
  amount: number
  referenceId: string
  description: string
  metadata?: Record<string, unknown>
}

export interface CreditWalletInputDTO {
  userId: string
  amount: number
  category: TransactionCategory
  description: string
  referenceId?: string
  metadata?: Record<string, unknown>
}

export interface DebitWalletInputDTO {
  userId: string
  amount: number
  category: TransactionCategory
  description: string
  referenceId?: string
  metadata?: Record<string, unknown>
}
