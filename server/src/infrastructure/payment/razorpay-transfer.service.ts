import {
  CreateTransferParams,
  ITransferService,
  TransferResult,
} from "@/core/application/interfaces/transfer.interface"
import { env } from "process"
import logger from "@/configs/logger.config"
import Razorpay from "razorpay"

export class RazorpayTransferService implements ITransferService {
  private razorpay: Razorpay

  constructor() {
    this.razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    })
  }

  async transfer(params: CreateTransferParams): Promise<TransferResult> {
    try {
      const transfer = await this.razorpay.transfers.create({
        amount: params.amountInPaise,
        currency: params.currency ?? "INR",
        account: params.recipientId,
      })
      return {
        transferId: transfer.id,
        status: transfer.status === "processed" ? "SUCCESS" : "FAILED",
      }
    } catch (error: any) {
      const errorMsg =
        error?.error?.description || error?.message || "Failed to execute payment transfer"

      logger.error(
        `Razorpay transfer creation error: ${errorMsg} (code: ${error?.error?.code || "UNKNOWN"})`
      )

      throw new Error(errorMsg)
    }
  }
}
