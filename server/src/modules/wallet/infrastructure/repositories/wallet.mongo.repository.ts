import mongoose from "mongoose"
import { IWalletRepository } from "../../domain/repositories/wallet.repository.interface"
import { Wallet } from "../../domain/entities/wallet.entity"
import { WalletTransaction } from "../../domain/entities/wallet-transaction.entity"
import { WalletModel } from "../models/wallet.model"
import { WalletTransactionModel } from "../models/wallet-transaction.model"
import { WalletPersistenceMapper } from "../mappers/wallet.persistence.mapper"
import { Money } from "../../domain/value-objects/money.vo"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"

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

      // Update wallet balance in database
      const savedWalletDoc = await WalletModel.findByIdAndUpdate(
        domainWallet.id,
        {
          balance: updatedWallet.balance.amount,
          status: updatedWallet.status,
        },
        { new: true, runValidators: true, ...opts }
      )

      if (!savedWalletDoc) {
        throw new AppError("Failed to update wallet balance", HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }

      // Create transaction ledger record in database
      const txDocs = await WalletTransactionModel.create(
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
