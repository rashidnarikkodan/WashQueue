import { DebitWalletUseCase } from "./debit-wallet.use-case"
import { PayWithWalletInputDTO, WalletTransactionDTO } from "../dtos/wallet.dto"
import { IPayWithWalletUseCase } from "../interfaces/wallet.use-cases"

export class PayWithWalletUseCase implements IPayWithWalletUseCase {
  constructor(private readonly debitWalletUseCase: DebitWalletUseCase) {}

  public async execute(input: PayWithWalletInputDTO): Promise<WalletTransactionDTO> {
    return this.debitWalletUseCase.execute({
      userId: input.userId,
      amount: input.amount,
      category: "BOOKING_PAYMENT",
      description: input.description || `Payment for booking ${input.referenceId}`,
      referenceId: input.referenceId,
      metadata: input.metadata,
    })
  }
}
