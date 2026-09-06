export type NotificationType = "BOOKING" | "PAYMENT" | "QUEUE" | "SYSTEM"
export type NotificationChannel = "IN_APP" | "PUSH" | "EMAIL" | "SMS"
export type NotificationActionType = "NAVIGATE" | "RELOAD" | "DISMISS" | "NONE"

export interface NotificationDto {
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
  createdAt: string | Date
  updatedAt?: string | Date
}

export interface PaginatedNotificationsDto {
  items: NotificationDto[]
  total: number
  page: number
  limit: number
  totalPages: number
  unreadCount: number
}

export interface GetNotificationsQuery {
  page?: number
  limit?: number
  isRead?: boolean
  type?: NotificationType
}
