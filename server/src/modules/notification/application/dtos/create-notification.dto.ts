import {
  NotificationActionType,
  NotificationChannel,
  NotificationType,
} from "../../domain/types/notification.types"

export interface CreateNotificationDto {
  recipientId: string
  userId?: string
  senderId?: string
  type: NotificationType
  title: string
  channel?: NotificationChannel
  actionType?: NotificationActionType
  message: string
  data?: string | Record<string, unknown>
  expiresAt?: Date | string
}
