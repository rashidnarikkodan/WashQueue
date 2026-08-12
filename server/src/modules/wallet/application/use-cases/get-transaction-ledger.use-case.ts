import {
  IWalletTransactionRepository,
  LedgerFilterOptions,
} from "../../domain/repositories/wallet-transaction.repository.interface"
import { WalletTransactionDTO } from "../dtos/wallet.dto"
import { WalletMapper } from "../mappers/wallet.mapper"

export interface PaginatedLedgerDTO {
  transactions: WalletTransactionDTO[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class GetTransactionLedgerUseCase {
  constructor(
    private readonly transactionRepository: IWalletTransactionRepository
  ) {}

  public async execute(
    userId: string,
    options?: LedgerFilterOptions
  ): Promise<PaginatedLedgerDTO> {
    const result = await this.transactionRepository.findByUserId(
      userId,
      options
    )

    return {
      transactions: result.transactions.map(WalletMapper.transactionToDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    }
  }
}
