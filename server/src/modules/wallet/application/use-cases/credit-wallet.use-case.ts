import { IWalletRepository } from "../../domain/repositories/wallet.repository.interface"
import { Money } from "../../domain/value-objects/money.vo"
import { CreditWalletInputDTO, WalletTransactionDTO } from "../dtos/wallet.dto"
import { WalletMapper } from "../mappers/wallet.mapper"
import { ICreditWalletUseCase } from "../interfaces/wallet.use-cases"
import { NotificationDispatcherService } from "@/modules/notification/notification.module"

export class CreditWalletUseCase implements ICreditWalletUseCase {
  constructor(
    private readonly walletRepository: IWalletRepository,
    private readonly notificationDispatcher?: NotificationDispatcherService
  ) {}

  public async execute(input: CreditWalletInputDTO): Promise<WalletTransactionDTO> {
    const moneyAmount = new Money(input.amount)

    const result = await this.walletRepository.executeAtomicOperation(input.userId, (wallet) => {
      return wallet.credit(
        moneyAmount,
        input.category,
        input.description,
        input.referenceId,
        input.metadata
      )
    })

    if (this.notificationDispatcher && input.category === "TOP_UP") {
      try {
        await this.notificationDispatcher.dispatch({
          recipientId: input.userId,
          type: "PAYMENT",
          title: "Wallet Top-Up Successful",
          message: `₹${input.amount} has been added to your WashQueue wallet balance.`,
          data: {
            amount: input.amount,
            referenceId: input.referenceId,
            url: "/wallet",
          },
          actionType: "NAVIGATE",
        })
      } catch {
        // Non-blocking
      }
    }

    return WalletMapper.transactionToDTO(result.transaction)
  }
}
