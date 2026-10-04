export interface PayoutWebhookResult {
  success: boolean
  message?: string
}

export interface IHandlePayoutWebhookUseCase {
  execute(rawBody: string, signature: string): Promise<PayoutWebhookResult>
}
