import { Wallet } from "../../domain/entities/wallet.entity"
import { WalletTransaction } from "../../domain/entities/wallet-transaction.entity"
import { Money } from "../../domain/value-objects/money.vo"
import { IWalletDocument } from "../models/wallet.model"
import { IWalletTransactionDocument } from "../models/wallet-transaction.model"

export class WalletPersistenceMapper {
  public static toDomainWallet(doc: IWalletDocument): Wallet {
    return new Wallet({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      balance: new Money(doc.balance, doc.currency),
      currency: doc.currency,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })
  }

  public static toDomainTransaction(doc: IWalletTransactionDocument): WalletTransaction {
    return new WalletTransaction({
      id: doc._id.toString(),
      walletId: doc.walletId.toString(),
      userId: doc.userId.toString(),
      type: doc.type,
      category: doc.category,
      amount: new Money(doc.amount),
      balanceBefore: new Money(doc.balanceBefore),
      balanceAfter: new Money(doc.balanceAfter),
      referenceId: doc.referenceId,
      description: doc.description,
      status: doc.status,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
    })
  }
}
