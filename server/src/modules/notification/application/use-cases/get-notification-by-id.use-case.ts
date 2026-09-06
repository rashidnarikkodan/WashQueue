import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { INotificationRepository } from "../../domain/repositories/notification.repository.interface"
import { NotificationResponseDto } from "../dtos/notification-response.dto"
import { IGetNotificationByIdUseCase } from "../interfaces/notification-usecases.interface"

export class GetNotificationByIdUseCase implements IGetNotificationByIdUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(id: string, userId: string): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.findById(id)

    if (!notification || notification.userId !== userId) {
      throw new AppError("Notification not found", HTTP_STATUS.NOT_FOUND)
    }

    return notification.data
  }
}
