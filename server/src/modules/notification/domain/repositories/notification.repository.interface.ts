import { IBaseRepository } from "@/core/domain/repository.interface"
import { Notification } from "../entities/Notification"
import { NotificationQueryFilter } from "../types/notification.types"

export interface PaginatedNotificationResult {
  notifications: Notification[]
  total: number
  unreadCount: number
}

export interface INotificationRepository extends IBaseRepository<Notification> {
  findByRecipientId(
    recipientId: string,
    filter?: NotificationQueryFilter
  ): Promise<PaginatedNotificationResult>
  countUnreadByRecipientId(recipientId: string): Promise<number>
  markAllAsReadByRecipientId(recipientId: string): Promise<number>
  markAsRead(id: string, recipientId: string): Promise<Notification | null>
  markAsActioned(id: string, recipientId: string): Promise<Notification | null>
  deleteByIdAndRecipientId(id: string, recipientId: string): Promise<boolean>
}
