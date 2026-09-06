import { IMapper } from "@/core/domain/repository.interface"
import { Notification, NotificationProps } from "../../domain/entities/Notification"
import { INotificationDocument } from "../models/notification.model"
import {
  NotificationActionType,
  NotificationChannel,
  NotificationType,
} from "../../domain/types/notification.types"
import { Types } from "mongoose"

export class NotificationMapper implements IMapper<Notification, INotificationDocument> {
  toDomain(raw: INotificationDocument): Notification {
    const props: NotificationProps = {
      id: raw._id.toString(),
      recipientId: raw.recipientId.toString(),
      type: raw.type as NotificationType,
      title: raw.title,
      channel: raw.channel as NotificationChannel,
      actionType: raw.actionType as NotificationActionType,
      message: raw.message,
      data: raw.data,
      isRead: raw.isRead,
      isActioned: raw.isActioned,
      isDeleted: raw.isDeleted ?? false,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      expiresAt: raw.expiresAt,
    }
    return new Notification(props)
  }

  toPersistence(entity: Partial<Notification>): Partial<INotificationDocument> {
    const isEntity = entity instanceof Notification
    const data = isEntity ? (entity as Notification).data : (entity as Partial<NotificationProps>)
    const persist: Partial<INotificationDocument> = {}

    if (data) {
      if (data.recipientId) {
        persist.recipientId = new Types.ObjectId(data.recipientId)
      }
      if (data.type !== undefined) {
        persist.type = data.type
      }
      if (data.title !== undefined) {
        persist.title = data.title
      }
      if (data.channel !== undefined) {
        persist.channel = data.channel
      }
      if (data.actionType !== undefined) {
        persist.actionType = data.actionType
      }
      if (data.message !== undefined) {
        persist.message = data.message
      }
      if (data.data !== undefined) {
        persist.data = data.data
      }
      if (data.isRead !== undefined) {
        persist.isRead = data.isRead
      }
      if (data.isActioned !== undefined) {
        persist.isActioned = data.isActioned
      }
      if (data.isDeleted !== undefined) {
        persist.isDeleted = data.isDeleted
      }
      if (data.expiresAt !== undefined) {
        persist.expiresAt = data.expiresAt
      }
    }

    return persist
  }
}
