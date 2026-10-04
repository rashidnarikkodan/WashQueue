import {
  NotificationActionType,
  NotificationChannel,
  NotificationType,
} from "../../domain/types/notification.types"

export interface NotificationResponseDto {
  id: string
  recipientId: string
  senderId?: string
  type: NotificationType
  title: string
  channel: NotificationChannel
  actionType: NotificationActionType
  message: string
  data: string
  isRead: boolean
  isActioned: boolean
  isDeleted?: boolean
  createdAt: Date
  updatedAt?: Date
  expiresAt?: Date
}
