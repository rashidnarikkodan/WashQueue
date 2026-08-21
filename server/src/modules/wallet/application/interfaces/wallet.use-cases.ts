import {
  CreditWalletInputDTO,
  DebitWalletInputDTO,
  PayWithWalletInputDTO,
  TopUpOrderDTO,
  VerifyTopUpPaymentDTO,
  WalletDTO,
  WalletTransactionDTO,
} from "../dtos/wallet.dto"
import { LedgerFilterOptions } from "../../domain/repositories/wallet-transaction.repository.interface"
import { PaginatedLedgerDTO } from "../use-cases/get-transaction-ledger.use-case"

export interface ICreateTopUpOrderUseCase {
  execute(
    userId: string,
    amount: number,
    currency?: string
  ): Promise<TopUpOrderDTO>
}

export interface ICreditWalletUseCase {
  execute(input: CreditWalletInputDTO): Promise<WalletTransactionDTO>
}

export interface IDebitWalletUseCase {
  execute(input: DebitWalletInputDTO): Promise<WalletTransactionDTO>
}

export interface IGetTransactionLedgerUseCase {
  execute(
    userId: string,
    options?: LedgerFilterOptions
  ): Promise<PaginatedLedgerDTO>
}

export interface IGetWalletBalanceUseCase {
  execute(userId: string): Promise<WalletDTO>
}

export interface IPayWithWalletUseCase {
  execute(input: PayWithWalletInputDTO): Promise<WalletTransactionDTO>
}

export interface IRefundWalletUseCase {
  execute(input: CreditWalletInputDTO): Promise<WalletTransactionDTO>
}

export interface IVerifyTopUpPaymentUseCase {
  execute(
    userId: string,
    amount: number,
    dto: VerifyTopUpPaymentDTO
  ): Promise<WalletTransactionDTO>
}
