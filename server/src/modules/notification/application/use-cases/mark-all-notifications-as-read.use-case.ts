import { INotificationRepository } from "../../domain/repositories/notification.repository.interface"
import { IMarkAllNotificationsAsReadUseCase } from "../interfaces/notification-usecases.interface"

export class MarkAllNotificationsAsReadUseCase implements IMarkAllNotificationsAsReadUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(userId: string): Promise<{ updatedCount: number }> {
    const updatedCount = await this.notificationRepository.markAllAsReadByUserId(userId)
    return { updatedCount }
  }
}
