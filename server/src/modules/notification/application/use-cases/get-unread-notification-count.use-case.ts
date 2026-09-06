import { INotificationRepository } from "../../domain/repositories/notification.repository.interface"
import { IGetUnreadNotificationCountUseCase } from "../interfaces/notification-usecases.interface"

export class GetUnreadNotificationCountUseCase implements IGetUnreadNotificationCountUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(userId: string): Promise<{ unreadCount: number }> {
    const unreadCount = await this.notificationRepository.countUnreadByUserId(userId)
    return { unreadCount }
  }
}
