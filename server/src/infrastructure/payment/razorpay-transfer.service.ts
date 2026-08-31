import { CreateTransferParams, ITransferService, TransferResult } from "@/core/application/interfaces/transfer.interface"
import { env } from "process"
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
    const transfer = await this.razorpay.transfers.create({
      amount: params.amountInPaise,
      currency: params.currency ?? "INR",
      account: params.recipientId, // need to give account of owner or who u transfer to
    })
    return {
      transferId: transfer.id,
      status: transfer.status === "processed" ? "SUCCESS" : "FAILED",
    }
  }
}
