import { Schema, model, Document, Types } from "mongoose"

export interface INotificationDocument extends Document {
  recipientId: Types.ObjectId
  senderId?: Types.ObjectId | null
  type: string
  title: string
  channel: string
  actionType: string
  message: string
  data: string
  isRead: boolean
  isActioned: boolean
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ["BOOKING", "PAYMENT", "QUEUE", "SYSTEM"],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    channel: {
      type: String,
      default: "IN_APP",
      trim: true,
    },
    actionType: {
      type: String,
      default: "NONE",
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: String,
      default: "{}",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActioned: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
)

notificationSchema.index({ recipientId: 1, isDeleted: 1, createdAt: -1 })
notificationSchema.index({ recipientId: 1, isDeleted: 1, isRead: 1 })
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const NotificationModel = model<INotificationDocument>("Notification", notificationSchema)
