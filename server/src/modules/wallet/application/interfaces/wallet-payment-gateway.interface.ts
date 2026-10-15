import { TopUpOrderDTO } from "../dtos/wallet.dto"

export interface IWalletPaymentGateway {
  createTopUpOrder(userId: string, amount: number, currency?: string): Promise<TopUpOrderDTO>
  verifyTopUpSignature(orderId: string, paymentId: string, signature: string): boolean
  getOrderDetails(
    orderId: string
  ): Promise<{ id: string; amountInPaise: number; currency: string; status: string; notes?: Record<string, string> }>
}
