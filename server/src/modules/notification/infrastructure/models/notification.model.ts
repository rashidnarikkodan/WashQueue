import { Schema, model, Document, Types } from "mongoose"

export interface INotificationDocument extends Document {
  userId: Types.ObjectId
  type: string
  title: string
  channel: string
  actionType: string
  message: string
  data: string
  isRead: boolean
  isActioned: boolean
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
  },
  {
    timestamps: true,
  }
)

notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ userId: 1, isRead: 1 })

export const NotificationModel = model<INotificationDocument>("Notification", notificationSchema)
