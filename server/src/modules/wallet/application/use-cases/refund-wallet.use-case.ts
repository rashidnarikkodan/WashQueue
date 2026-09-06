import { IWalletRepository } from "../../domain/repositories/wallet.repository.interface"
import { Money } from "../../domain/value-objects/money.vo"
import { CreditWalletInputDTO, WalletTransactionDTO } from "../dtos/wallet.dto"
import { WalletMapper } from "../mappers/wallet.mapper"
import { IRefundWalletUseCase } from "../interfaces/wallet.use-cases"

export class RefundWalletUseCase implements IRefundWalletUseCase {
  constructor(private readonly walletRepository: IWalletRepository) {}

  public async execute(input: CreditWalletInputDTO): Promise<WalletTransactionDTO> {
    const moneyAmount = new Money(input.amount)

    const result = await this.walletRepository.executeAtomicOperation(input.userId, (wallet) => {
      return wallet.refund(
        moneyAmount,
        input.category || "REFUND",
        input.description,
        input.referenceId,
        input.metadata
      )
    })

    return WalletMapper.transactionToDTO(result.transaction)
  }
}
