import { IWalletRepository } from "../../domain/repositories/wallet.repository.interface"
import { Wallet } from "../../domain/entities/wallet.entity"
import { Money } from "../../domain/value-objects/money.vo"
import { WalletDTO } from "../dtos/wallet.dto"
import { WalletMapper } from "../mappers/wallet.mapper"

export class GetWalletBalanceUseCase {
  constructor(private readonly walletRepository: IWalletRepository) {}

  public async execute(userId: string): Promise<WalletDTO> {
    let wallet = await this.walletRepository.findByUserId(userId)

    if (!wallet) {
      // Auto-initialize empty wallet for first-time user query
      const newWallet = new Wallet({
        userId,
        balance: Money.zero("INR"),
        currency: "INR",
        status: "ACTIVE",
      })
      wallet = await this.walletRepository.create(newWallet)
    }

    return WalletMapper.toDTO(wallet)
  }
}
