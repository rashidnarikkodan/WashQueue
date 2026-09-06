import { INotificationRepository } from "../../domain/repositories/notification.repository.interface"
import { GetNotificationsQueryDto, PaginatedNotificationsDto } from "../dtos/get-notifications.dto"
import { IGetNotificationsUseCase } from "../interfaces/notification-usecases.interface"

export class GetNotificationsUseCase implements IGetNotificationsUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(
    userId: string,
    query?: GetNotificationsQueryDto
  ): Promise<PaginatedNotificationsDto> {
    const page = query?.page && query.page > 0 ? query.page : 1
    const limit = query?.limit && query.limit > 0 ? Math.min(query.limit, 100) : 20

    const { notifications, total, unreadCount } = await this.notificationRepository.findByUserId(
      userId,
      {
        ...query,
        page,
        limit,
      }
    )

    const totalPages = Math.ceil(total / limit) || 1

    return {
      items: notifications.map((n) => n.data),
      total,
      page,
      limit,
      totalPages,
      unreadCount,
    }
  }
}
