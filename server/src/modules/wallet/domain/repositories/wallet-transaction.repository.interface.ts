import {
  WalletTransaction,
  TransactionType,
  TransactionCategory,
} from "../entities/wallet-transaction.entity"

export interface LedgerFilterOptions {
  page?: number
  limit?: number
  type?: TransactionType
  category?: TransactionCategory
  startDate?: Date
  endDate?: Date
}

export interface PaginatedLedgerResult {
  transactions: WalletTransaction[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface IWalletTransactionRepository {
  create(transaction: WalletTransaction): Promise<WalletTransaction>
  findByWalletId(walletId: string, options?: LedgerFilterOptions): Promise<PaginatedLedgerResult>
  findByUserId(userId: string, options?: LedgerFilterOptions): Promise<PaginatedLedgerResult>
  findByReferenceId(referenceId: string): Promise<WalletTransaction | null>
}
