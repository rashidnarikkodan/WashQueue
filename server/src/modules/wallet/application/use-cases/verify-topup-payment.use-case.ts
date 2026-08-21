import { IWalletPaymentGateway } from "../interfaces/wallet-payment-gateway.interface"
import { CreditWalletUseCase } from "./credit-wallet.use-case"
import { VerifyTopUpPaymentDTO, WalletTransactionDTO } from "../dtos/wallet.dto"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { IWalletTransactionRepository } from "../../domain/repositories/wallet-transaction.repository.interface"
import { IVerifyTopUpPaymentUseCase } from "../interfaces/wallet.use-cases"

export class VerifyTopUpPaymentUseCase implements IVerifyTopUpPaymentUseCase {
  constructor(
    private readonly paymentGateway: IWalletPaymentGateway,
    private readonly creditWalletUseCase: CreditWalletUseCase,
    private readonly transactionRepository: IWalletTransactionRepository
  ) {}

  public async execute(
    userId: string,
    amount: number,
    dto: VerifyTopUpPaymentDTO
  ): Promise<WalletTransactionDTO> {
    const isValidSignature = this.paymentGateway.verifyTopUpSignature(
      dto.razorpayOrderId,
      dto.razorpayPaymentId,
      dto.razorpaySignature
    )

    if (!isValidSignature) {
      throw new AppError(
        "Invalid payment signature verification failed",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const existingTx = await this.transactionRepository.findByReferenceId(
      dto.razorpayPaymentId
    )
    if (existingTx) {
      throw new AppError(
        "This payment has already been credited to your wallet",
        HTTP_STATUS.CONFLICT
      )
    }

    return this.creditWalletUseCase.execute({
      userId,
      amount,
      category: "TOP_UP",
      description: `Wallet top-up via Razorpay (${dto.razorpayPaymentId})`,
      referenceId: dto.razorpayPaymentId,
      metadata: {
        razorpayOrderId: dto.razorpayOrderId,
        razorpayPaymentId: dto.razorpayPaymentId,
      },
    })
  }
}
