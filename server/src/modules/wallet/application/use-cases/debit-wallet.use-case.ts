import { IWalletRepository } from "../../domain/repositories/wallet.repository.interface"
import { Money } from "../../domain/value-objects/money.vo"
import { DebitWalletInputDTO, WalletTransactionDTO } from "../dtos/wallet.dto"
import { WalletMapper } from "../mappers/wallet.mapper"

export class DebitWalletUseCase {
  constructor(private readonly walletRepository: IWalletRepository) {}

  public async execute(input: DebitWalletInputDTO): Promise<WalletTransactionDTO> {
    const moneyAmount = new Money(input.amount)

    const result = await this.walletRepository.executeAtomicOperation(input.userId, (wallet) => {
      return wallet.debit(
        moneyAmount,
        input.category,
        input.description,
        input.referenceId,
        input.metadata
      )
    })

    return WalletMapper.transactionToDTO(result.transaction)
  }
}
