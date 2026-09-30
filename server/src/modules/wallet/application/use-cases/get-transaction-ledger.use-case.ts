import {
  IWalletTransactionRepository,
  LedgerFilterOptions,
} from "../../domain/repositories/wallet-transaction.repository.interface"
import { PaginatedLedgerDTO } from "../dtos/wallet.dto"
import { WalletMapper } from "../mappers/wallet.mapper"
import { IGetTransactionLedgerUseCase } from "../interfaces/wallet.use-cases"

export class GetTransactionLedgerUseCase implements IGetTransactionLedgerUseCase {
  constructor(private readonly transactionRepository: IWalletTransactionRepository) {}

  public async execute(userId: string, options?: LedgerFilterOptions): Promise<PaginatedLedgerDTO> {
    const result = await this.transactionRepository.findByUserId(userId, options)

    return {
      transactions: result.transactions.map(WalletMapper.transactionToDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    }
  }
}
