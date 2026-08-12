import {
  IWalletTransactionRepository,
  LedgerFilterOptions,
  PaginatedLedgerResult,
} from "../../domain/repositories/wallet-transaction.repository.interface"
import { WalletTransaction } from "../../domain/entities/wallet-transaction.entity"
import { WalletTransactionModel } from "../models/wallet-transaction.model"
import { WalletPersistenceMapper } from "../mappers/wallet.persistence.mapper"

export class WalletTransactionMongoRepository implements IWalletTransactionRepository {
  public async create(transaction: WalletTransaction): Promise<WalletTransaction> {
    const doc = await WalletTransactionModel.create({
      walletId: transaction.walletId,
      userId: transaction.userId,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.amount,
      balanceBefore: transaction.balanceBefore.amount,
      balanceAfter: transaction.balanceAfter.amount,
      referenceId: transaction.referenceId,
      description: transaction.description,
      status: transaction.status,
      metadata: transaction.metadata,
    })
    return WalletPersistenceMapper.toDomainTransaction(doc)
  }

  public async findByWalletId(
    walletId: string,
    options?: LedgerFilterOptions
  ): Promise<PaginatedLedgerResult> {
    const query: Record<string, unknown> = { walletId }
    return this.executeQuery(query, options)
  }

  public async findByUserId(
    userId: string,
    options?: LedgerFilterOptions
  ): Promise<PaginatedLedgerResult> {
    const query: Record<string, unknown> = { userId }
    return this.executeQuery(query, options)
  }

  public async findByReferenceId(referenceId: string): Promise<WalletTransaction | null> {
    const doc = await WalletTransactionModel.findOne({ referenceId })
    if (!doc) return null
    return WalletPersistenceMapper.toDomainTransaction(doc)
  }

  private async executeQuery(
    baseQuery: Record<string, unknown>,
    options?: LedgerFilterOptions
  ): Promise<PaginatedLedgerResult> {
    const page = options?.page && options.page > 0 ? options.page : 1
    const limit = options?.limit && options.limit > 0 ? options.limit : 20
    const skip = (page - 1) * limit

    const filter: Record<string, unknown> = { ...baseQuery }

    if (options?.type) {
      filter.type = options.type
    }
    if (options?.category) {
      filter.category = options.category
    }

    if (options?.startDate || options?.endDate) {
      const dateFilter: Record<string, Date> = {}
      if (options.startDate) {
        dateFilter.$gte = options.startDate
      }
      if (options.endDate) {
        dateFilter.$lte = options.endDate
      }
      filter.createdAt = dateFilter
    }

    const [docs, total] = await Promise.all([
      WalletTransactionModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      WalletTransactionModel.countDocuments(filter),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    return {
      transactions: docs.map(WalletPersistenceMapper.toDomainTransaction),
      total,
      page,
      limit,
      totalPages,
    }
  }
}
