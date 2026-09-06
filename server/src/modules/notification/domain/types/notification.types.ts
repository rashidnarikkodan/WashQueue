export type NotificationType = "BOOKING" | "PAYMENT" | "QUEUE" | "SYSTEM"

export type NotificationChannel = "IN_APP" | "PUSH" | "EMAIL" | "SMS" | string

export type NotificationActionType = "NAVIGATE" | "OPEN_MODAL" | "EXTERNAL_LINK" | "NONE" | string

export interface NotificationQueryFilter {
  isRead?: boolean
  type?: NotificationType
  page?: number
  limit?: number
}
