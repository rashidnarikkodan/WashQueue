import { Wallet } from "../../domain/entities/wallet.entity"
import { WalletTransaction } from "../../domain/entities/wallet-transaction.entity"
import { WalletDTO, WalletTransactionDTO } from "../dtos/wallet.dto"

export class WalletMapper {
  public static toDTO(wallet: Wallet): WalletDTO {
    return {
      id: wallet.id || "",
      userId: wallet.userId,
      balance: wallet.balance.amount,
      currency: wallet.currency,
      status: wallet.status,
      createdAt: wallet.createdAt.toISOString(),
      updatedAt: wallet.updatedAt.toISOString(),
    }
  }

  public static transactionToDTO(transaction: WalletTransaction): WalletTransactionDTO {
    return {
      id: transaction.id || "",
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
      createdAt: transaction.createdAt.toISOString(),
    }
  }
}
