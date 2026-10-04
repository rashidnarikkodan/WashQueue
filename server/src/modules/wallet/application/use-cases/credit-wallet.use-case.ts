import env from "@/configs/env.config"
import logger from "@/configs/logger.config"
import { IWalletRepository } from "../../domain/repositories/wallet.repository.interface"
import { Money } from "../../domain/value-objects/money.vo"
import { CreditWalletInputDTO, WalletTransactionDTO } from "../dtos/wallet.dto"
import { WalletMapper } from "../mappers/wallet.mapper"
import { ICreditWalletUseCase } from "../interfaces/wallet.use-cases"
import { INotificationDispatcherService } from "@/modules/notification/notification.module"
import { IMailService } from "@/core/application/interfaces/mail.interface"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"

export class CreditWalletUseCase implements ICreditWalletUseCase {
  constructor(
    private readonly walletRepository: IWalletRepository,
    private readonly notificationDispatcher?: INotificationDispatcherService,
    private readonly mailService?: IMailService,
    private readonly userRepository?: IUserRepository
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

    if (input.category === "TOP_UP") {
      if (this.notificationDispatcher) {
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

      if (this.mailService && this.userRepository) {
        try {
          const user = await this.userRepository.findById(input.userId)
          if (user && user.email) {
            await this.mailService.sendPaymentReceiptEmail(user.email, {
              customerName: user.name || "Customer",
              transactionId: input.referenceId || `TXN-TOPUP-${Date.now()}`,
              amount: input.amount,
              paymentMethod: "ONLINE (Razorpay)",
              paymentStatus: "SUCCESS",
              date: new Date().toLocaleDateString(),
              description: "WashQueue Wallet Balance Top-Up",
              receiptUrl: `${env.CLIENT_URL}/wallet`,
            })
          }
        } catch (mailErr) {
          logger.error(
            { error: mailErr, userId: input.userId },
            "[CreditWallet] Failed to send top-up payment receipt email"
          )
        }
      }
    }

    return WalletMapper.transactionToDTO(result.transaction)
  }
}
