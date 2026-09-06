import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { INotificationRepository } from "../../domain/repositories/notification.repository.interface"
import { NotificationResponseDto } from "../dtos/notification-response.dto"
import { IMarkNotificationAsReadUseCase } from "../interfaces/notification-usecases.interface"

export class MarkNotificationAsReadUseCase implements IMarkNotificationAsReadUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(id: string, userId: string): Promise<NotificationResponseDto> {
    const updated = await this.notificationRepository.markAsRead(id, userId)

    if (!updated) {
      throw new AppError("Notification not found", HTTP_STATUS.NOT_FOUND)
    }

    return updated.data
  }
}
