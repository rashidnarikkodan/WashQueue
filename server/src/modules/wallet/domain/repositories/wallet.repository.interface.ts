import { Wallet } from "../entities/wallet.entity"
import { WalletTransaction } from "../entities/wallet-transaction.entity"

export interface IWalletRepository {
  findByUserId(userId: string): Promise<Wallet | null>
  findById(id: string): Promise<Wallet | null>
  create(wallet: Wallet): Promise<Wallet>
  save(wallet: Wallet): Promise<Wallet>
  executeAtomicOperation(
    userId: string,
    operation: (wallet: Wallet) => { updatedWallet: Wallet; transaction: WalletTransaction }
  ): Promise<{ wallet: Wallet; transaction: WalletTransaction }>
}
