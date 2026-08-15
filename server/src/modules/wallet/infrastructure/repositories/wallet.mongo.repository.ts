import mongoose from "mongoose"
import { IWalletRepository } from "../../domain/repositories/wallet.repository.interface"
import { Wallet } from "../../domain/entities/wallet.entity"
import { WalletTransaction } from "../../domain/entities/wallet-transaction.entity"
import { WalletModel } from "../models/wallet.model"
import { WalletTransactionModel } from "../models/wallet-transaction.model"
import { WalletPersistenceMapper } from "../mappers/wallet.persistence.mapper"
import { AppError } from "@/common/errors/app-error"
import { ConflictError } from "@/common/errors/conflict-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"

const MAX_CONCURRENCY_RETRIES = 5

export class WalletMongoRepository implements IWalletRepository {
  public async findByUserId(userId: string): Promise<Wallet | null> {
    const doc = await WalletModel.findOne({ userId })
    if (!doc) return null
    return WalletPersistenceMapper.toDomainWallet(doc)
  }

  public async findById(id: string): Promise<Wallet | null> {
    const doc = await WalletModel.findById(id)
    if (!doc) return null
    return WalletPersistenceMapper.toDomainWallet(doc)
  }

  public async create(wallet: Wallet): Promise<Wallet> {
    const doc = await WalletModel.create({
      userId: wallet.userId,
      balance: wallet.balance.amount,
      currency: wallet.currency,
      status: wallet.status,
    })
    return WalletPersistenceMapper.toDomainWallet(doc)
  }

  public async save(wallet: Wallet): Promise<Wallet> {
    if (!wallet.id) {
      return this.create(wallet)
    }

    const doc = await WalletModel.findByIdAndUpdate(
      wallet.id,
      {
        balance: wallet.balance.amount,
        status: wallet.status,
      },
      { new: true, runValidators: true }
    )

    if (!doc) {
      throw new AppError("Wallet not found for save operation", HTTP_STATUS.NOT_FOUND)
    }

    return WalletPersistenceMapper.toDomainWallet(doc)
  }

  public async executeAtomicOperation(
    userId: string,
    operation: (wallet: Wallet) => { updatedWallet: Wallet; transaction: WalletTransaction }
  ): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
    for (let attempt = 1; attempt <= MAX_CONCURRENCY_RETRIES; attempt++) {
      try {
        return await this.attemptAtomicOperation(userId, operation)
      } catch (error) {
        const isLastAttempt = attempt === MAX_CONCURRENCY_RETRIES
        if (error instanceof ConflictError && !isLastAttempt) {
          continue
        }
        throw error
      }
    }
    // Unreachable: loop always returns or throws, but keeps TS happy.
    throw new ConflictError("Wallet update failed due to concurrent modification")
  }

  private async attemptAtomicOperation(
    userId: string,
    operation: (wallet: Wallet) => { updatedWallet: Wallet; transaction: WalletTransaction }
  ): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
    const session = await mongoose.startSession()
    let useTransaction = true

    try {
      session.startTransaction()
    } catch {
      useTransaction = false
    }

    try {
      const opts = useTransaction ? { session } : {}

      let walletDoc = await WalletModel.findOne({ userId }, null, opts)

      if (!walletDoc) {
        // Initialize empty wallet inside transaction if missing
        const createdDocs = await WalletModel.create(
          [
            {
              userId,
              balance: 0,
              currency: "INR",
              status: "ACTIVE",
            },
          ],
          opts
        )
        const createdWalletDoc = createdDocs[0]
        if (!createdWalletDoc) {
          throw new AppError("Failed to initialize wallet", HTTP_STATUS.INTERNAL_SERVER_ERROR)
        }
        walletDoc = createdWalletDoc
      }

      const domainWallet = WalletPersistenceMapper.toDomainWallet(walletDoc)
      const { updatedWallet, transaction } = operation(domainWallet)

      // Idempotency Guard: Check if transaction with referenceId has already completed
      if (transaction.referenceId) {
        const existingTxDoc = await WalletTransactionModel.findOne(
          {
            userId: new mongoose.Types.ObjectId(userId),
            referenceId: transaction.referenceId,
            type: transaction.type,
            status: "COMPLETED",
          },
          null,
          opts
        )
        if (existingTxDoc) {
          if (useTransaction) {
            await session.commitTransaction()
          }
          return {
            wallet: domainWallet,
            transaction: WalletPersistenceMapper.toDomainTransaction(existingTxDoc),
          }
        }
      }

      // Optimistic-concurrency write: the filter only matches if `balance` is still what we
      // read above, so a concurrent credit/debit that lands between our read and this write
      // causes this to match nothing (rather than silently overwriting the other update).
      const savedWalletDoc = await WalletModel.findOneAndUpdate(
        { _id: walletDoc._id, balance: walletDoc.balance },
        {
          balance: updatedWallet.balance.amount,
          status: updatedWallet.status,
        },
        { new: true, runValidators: true, ...opts }
      )

      if (!savedWalletDoc) {
        throw new ConflictError("Wallet balance changed concurrently, retry required")
      }

      // Synchronize cached walletBalance on User model atomically
      try {
        const { User: UserModel } = await import("@/modules/user/infrastructure/model/user.model")
        await UserModel.findByIdAndUpdate(
          userId,
          { $set: { walletBalance: updatedWallet.balance.amount } },
          opts
        )
      } catch (userSyncErr) {
        // Log sync warning but proceed
        console.warn(`[Wallet] Failed to sync user walletBalance for ${userId}:`, userSyncErr)
      }

      // Create transaction ledger record in database
      let txDocs
      try {
        txDocs = await WalletTransactionModel.create(
          [
            {
              walletId: domainWallet.id,
              userId,
              type: transaction.type,
              category: transaction.category,
              amount: transaction.amount.amount,
              balanceBefore: transaction.balanceBefore.amount,
              balanceAfter: transaction.balanceAfter.amount,
              referenceId: transaction.referenceId,
              description: transaction.description,
              status: transaction.status,
              metadata: transaction.metadata,
            },
          ],
          opts
        )
      } catch (createError) {
        const isDuplicateKeyError =
          typeof createError === "object" &&
          createError !== null &&
          (createError as { code?: number }).code === 11000

        if (isDuplicateKeyError && transaction.referenceId) {
          // Another concurrent request already recorded this same (userId, referenceId, type)
          // transaction — the DB unique index caught what the earlier app-level check missed.
          if (useTransaction) {
            await session.abortTransaction()
          }
          const existingTxDoc = await WalletTransactionModel.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            referenceId: transaction.referenceId,
            type: transaction.type,
            status: "COMPLETED",
          })
          if (existingTxDoc) {
            return {
              wallet: domainWallet,
              transaction: WalletPersistenceMapper.toDomainTransaction(existingTxDoc),
            }
          }
        }
        throw createError
      }

      if (!txDocs || !txDocs[0]) {
        throw new AppError("Failed to record wallet transaction", HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }

      if (useTransaction) {
        await session.commitTransaction()
      }

      const finalWallet = WalletPersistenceMapper.toDomainWallet(savedWalletDoc)
      const finalTransaction = WalletPersistenceMapper.toDomainTransaction(txDocs[0])

      return {
        wallet: finalWallet,
        transaction: finalTransaction,
      }
    } catch (error) {
      if (useTransaction) {
        await session.abortTransaction()
      }
      throw error
    } finally {
      session.endSession()
    }
  }
}
