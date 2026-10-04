import { NotificationType } from "../../domain/types/notification.types"
import { NotificationResponseDto } from "./notification-response.dto"

export interface GetNotificationsQueryDto {
  isRead?: boolean
  type?: NotificationType
  isDeleted?: boolean
  page?: number
  limit?: number
}

export interface PaginatedNotificationsDto {
  items: NotificationResponseDto[]
  total: number
  page: number
  limit: number
  totalPages: number
  unreadCount: number
}
