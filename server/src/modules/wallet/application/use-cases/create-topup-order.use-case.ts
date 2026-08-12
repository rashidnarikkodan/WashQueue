import { IWalletPaymentGateway } from "../interfaces/wallet-payment-gateway.interface"
import { TopUpOrderDTO } from "../dtos/wallet.dto"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"

export class CreateTopUpOrderUseCase {
  constructor(private readonly paymentGateway: IWalletPaymentGateway) {}

  public async execute(
    userId: string,
    amount: number,
    currency: string = "INR"
  ): Promise<TopUpOrderDTO> {
    if (isNaN(amount) || amount < 1) {
      throw new AppError(
        "Top-up amount must be at least ₹1",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    return this.paymentGateway.createTopUpOrder(userId, amount, currency)
  }
}
