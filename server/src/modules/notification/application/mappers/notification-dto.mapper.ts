import { Notification } from "../../domain/entities/Notification"
import { NotificationResponseDto } from "../dtos/notification-response.dto"
import { PaginatedNotificationsDto } from "../dtos/get-notifications.dto"

export class NotificationDTOMapper {
  static toDTO(notification: Notification): NotificationResponseDto {
    const data = notification.data
    return {
      id: data.id,
      recipientId: data.recipientId,
      senderId: data.senderId,
      type: data.type,
      title: data.title,
      channel: data.channel,
      actionType: data.actionType,
      message: data.message,
      data: data.data,
      isRead: data.isRead,
      isActioned: data.isActioned,
      isDeleted: data.isDeleted,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      expiresAt: data.expiresAt,
    }
  }

  static toListDTO(notifications: Notification[]): NotificationResponseDto[] {
    return notifications.map((n) => NotificationDTOMapper.toDTO(n))
  }

  static toPaginatedDTO(
    items: Notification[],
    total: number,
    page: number,
    limit: number,
    unreadCount: number
  ): PaginatedNotificationsDto {
    return {
      items: NotificationDTOMapper.toListDTO(items),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      unreadCount,
    }
  }
}
