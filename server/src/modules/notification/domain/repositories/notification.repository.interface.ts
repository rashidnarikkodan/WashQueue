import { IBaseRepository } from "@/core/domain/repository.interface"
import { Notification } from "../entities/Notification"
import { NotificationQueryFilter } from "../types/notification.types"

export interface PaginatedNotificationResult {
  notifications: Notification[]
  total: number
  unreadCount: number
}

export interface INotificationRepository extends IBaseRepository<Notification> {
  findByUserId(
    userId: string,
    filter?: NotificationQueryFilter
  ): Promise<PaginatedNotificationResult>
  countUnreadByUserId(userId: string): Promise<number>
  markAllAsReadByUserId(userId: string): Promise<number>
  markAsRead(id: string, userId: string): Promise<Notification | null>
  markAsActioned(id: string, userId: string): Promise<Notification | null>
  deleteByIdAndUserId(id: string, userId: string): Promise<boolean>
}
