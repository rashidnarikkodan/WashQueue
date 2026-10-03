export interface RazorpayWebhookPayload {
  event: string
  payload: {
    payment?: {
      entity: {
        id: string
        order_id: string
        amount: number
        status: string
      }
    }
    order?: {
      entity: {
        id: string
        amount: number
        status: string
      }
    }
  }
}
