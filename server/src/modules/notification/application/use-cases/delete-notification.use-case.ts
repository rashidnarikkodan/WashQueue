import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { INotificationRepository } from "../../domain/repositories/notification.repository.interface"
import { IDeleteNotificationUseCase } from "../interfaces/notification-usecases.interface"

export class DeleteNotificationUseCase implements IDeleteNotificationUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const deleted = await this.notificationRepository.deleteByIdAndUserId(id, userId)

    if (!deleted) {
      throw new AppError("Notification not found", HTTP_STATUS.NOT_FOUND)
    }
  }
}
