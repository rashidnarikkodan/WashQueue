import { Notification } from "../../domain/entities/Notification"
import { INotificationRepository } from "../../domain/repositories/notification.repository.interface"
import { CreateNotificationDto } from "../dtos/create-notification.dto"
import { NotificationResponseDto } from "../dtos/notification-response.dto"
import { ICreateNotificationUseCase } from "../interfaces/notification-usecases.interface"

export class CreateNotificationUseCase implements ICreateNotificationUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const stringifiedData =
      typeof dto.data === "object" ? JSON.stringify(dto.data) : dto.data || "{}"

    const now = new Date()
    const expiresAt = dto.expiresAt
      ? new Date(dto.expiresAt)
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const notification = new Notification({
      id: "",
      recipientId: dto.recipientId || dto.userId || "",
      senderId: dto.senderId,
      type: dto.type,
      title: dto.title,
      channel: dto.channel || "IN_APP",
      actionType: dto.actionType || "NONE",
      message: dto.message,
      data: stringifiedData,
      isRead: false,
      isActioned: false,
      createdAt: now,
      expiresAt,
    })

    const saved = await this.notificationRepository.save(notification)
    return saved.data
  }
}
