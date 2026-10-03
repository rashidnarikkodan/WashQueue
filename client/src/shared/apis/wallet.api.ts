/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  WalletData,
  WalletTransactionItem,
  GetTransactionsQuery,
  PaginatedTransactionsResponse,
  TopUpOrderResponse,
  VerifyTopUpInput,
  PayWithWalletInput,
} from "../types/wallet.types"
export * from "../types/wallet.types"
import { api } from "@/shared/config/axios"
import { API_ROUTES } from "@/shared/constants/api.const"
import { handleApiError } from "@/shared/utils/handleApiError"

export const walletApi = {
  async getBalance(): Promise<WalletData> {
    try {
      const response = await api.get<{ success: boolean; data: WalletData }>(
        API_ROUTES.WALLET.BALANCE
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to fetch wallet balance")
    }
  },

  async getTransactions(query?: GetTransactionsQuery): Promise<PaginatedTransactionsResponse> {
    try {
      const response = await api.get<PaginatedTransactionsResponse>(
        API_ROUTES.WALLET.TRANSACTIONS,
        { params: query }
      )
      return response.data
    } catch (error) {
      throw handleApiError(error, "Failed to fetch transaction history")
    }
  },

  async createTopUpOrder(amount: number): Promise<TopUpOrderResponse["data"]> {
    try {
      const response = await api.post<TopUpOrderResponse>(API_ROUTES.WALLET.TOPUP_ORDER, { amount })
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to create top-up order")
    }
  },

  async verifyTopUpPayment(input: VerifyTopUpInput): Promise<WalletTransactionItem> {
    try {
      const response = await api.post<{
        success: boolean
        message: string
        data: WalletTransactionItem
      }>(API_ROUTES.WALLET.TOPUP_VERIFY, input)
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to verify top-up payment")
    }
  },

  async payWithWallet(input: PayWithWalletInput): Promise<WalletTransactionItem> {
    try {
      const response = await api.post<{
        success: boolean
        message: string
        data: WalletTransactionItem
      }>(API_ROUTES.WALLET.PAY, input)
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to process wallet payment")
    }
  },

  async exportTransactions(query?: GetTransactionsQuery): Promise<Blob> {
    try {
      const response = await api.get(API_ROUTES.WALLET.EXPORT, {
        params: query,
        responseType: "blob",
      })
      return response.data as Blob
    } catch (error) {
      throw handleApiError(error, "Failed to export transaction history")
    }
  },
}
