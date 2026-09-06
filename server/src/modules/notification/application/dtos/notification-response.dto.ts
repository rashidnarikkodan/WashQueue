import {
  NotificationActionType,
  NotificationChannel,
  NotificationType,
} from "../../domain/types/notification.types"

export interface NotificationResponseDto {
  id: string
  userId: string
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
}
