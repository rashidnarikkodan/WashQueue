import {
  NotificationActionType,
  NotificationChannel,
  NotificationType,
} from "../../domain/types/notification.types"

export interface NotificationResponseDto {
  id: string
  recipientId: string
  type: NotificationType
  title: string
  channel: NotificationChannel
  actionType: NotificationActionType
  message: string
  data: string
  isRead: boolean
  isActioned: boolean
  createdAt: Date
  updatedAt?: Date
  expiresAt?: Date
}
