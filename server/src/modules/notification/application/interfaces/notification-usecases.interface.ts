import { CreateNotificationDto } from "../dtos/create-notification.dto"
import { GetNotificationsQueryDto, PaginatedNotificationsDto } from "../dtos/get-notifications.dto"
import { NotificationResponseDto } from "../dtos/notification-response.dto"

export interface ICreateNotificationUseCase {
  execute(dto: CreateNotificationDto): Promise<NotificationResponseDto>
}

export interface IGetNotificationsUseCase {
  execute(recipientId: string, query?: GetNotificationsQueryDto): Promise<PaginatedNotificationsDto>
}

export interface IGetNotificationByIdUseCase {
  execute(id: string, recipientId: string): Promise<NotificationResponseDto>
}

export interface IMarkNotificationAsReadUseCase {
  execute(id: string, recipientId: string): Promise<NotificationResponseDto>
}

export interface IMarkAllNotificationsAsReadUseCase {
  execute(recipientId: string): Promise<{ updatedCount: number }>
}

export interface IMarkNotificationAsActionedUseCase {
  execute(id: string, recipientId: string): Promise<NotificationResponseDto>
}

export interface IDeleteNotificationUseCase {
  execute(id: string, recipientId: string): Promise<void>
}

export interface IGetUnreadNotificationCountUseCase {
  execute(recipientId: string): Promise<{ unreadCount: number }>
}
