import { Document, model, Schema } from "mongoose"

export interface IWebhookEventDocument extends Document {
  provider: string
  eventId: string
  eventType: string
  receivedAt: Date
}

const webhookEventSchema = new Schema<IWebhookEventDocument>({
  provider: {
    type: String,
    required: true,
  },
  eventId: {
    type: String,
    required: true,
  },
  eventType: {
    type: String,
    required: true,
  },
  receivedAt: {
    type: Date,
    default: Date.now,
  },
})

webhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true })

export const WebhookEventModel = model<IWebhookEventDocument>("WebhookEvent", webhookEventSchema)

export default WebhookEventModel
