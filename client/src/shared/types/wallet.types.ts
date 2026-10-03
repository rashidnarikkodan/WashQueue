export interface WalletData {
  id: string
  userId: string
  balance: number
  currency: string
  status: "ACTIVE" | "SUSPENDED" | "LOCKED"
  createdAt: string
  updatedAt: string
}

export interface WalletTransactionItem {
  id: string
  walletId: string
  userId: string
  type: "CREDIT" | "DEBIT" | "REFUND"
  category: "TOP_UP" | "BOOKING_PAYMENT" | "REFUND" | "CASHBACK" | "ADMIN_ADJUSTMENT"
  amount: number
  balanceBefore: number
  balanceAfter: number
  referenceId?: string
  description: string
  status: "COMPLETED" | "PENDING" | "FAILED"
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface GetTransactionsQuery {
  page?: number
  limit?: number
  type?: "CREDIT" | "DEBIT" | "REFUND"
  category?: "TOP_UP" | "BOOKING_PAYMENT" | "REFUND" | "CASHBACK" | "ADMIN_ADJUSTMENT"
  startDate?: string
  endDate?: string
}

export interface PaginatedTransactionsResponse {
  success: boolean
  data: WalletTransactionItem[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface TopUpOrderResponse {
  success: boolean
  data: {
    orderId: string
    amount: number
    currency: string
    receipt: string
    keyId?: string
  }
}

export interface VerifyTopUpInput {
  amount: number
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface PayWithWalletInput {
  amount: number
  referenceId: string
  description?: string
  metadata?: Record<string, unknown>
}
