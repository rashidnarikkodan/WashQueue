export interface CreateTransferParams {
  amountInPaise: number
  currency?: string
  recipientId: string
  referenceId: string
}

export interface TransferResult {
  transferId: string
  status: "SUCCESS" | "FAILED"
}

export interface ITransferService {
  transfer(params: CreateTransferParams): Promise<TransferResult>
}
