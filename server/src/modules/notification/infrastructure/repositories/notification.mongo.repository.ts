import { Types } from "mongoose"
import { BaseRepository } from "@/infrastructure/database/repository/base.repository"
import { Notification } from "../../domain/entities/Notification"
import {
  INotificationRepository,
  PaginatedNotificationResult,
} from "../../domain/repositories/notification.repository.interface"
import { NotificationQueryFilter } from "../../domain/types/notification.types"
import { NotificationMapper } from "../mappers/notification.mapper"
import { INotificationDocument, NotificationModel } from "../models/notification.model"

export class NotificationMongoRepository
  extends BaseRepository<Notification, INotificationDocument>
  implements INotificationRepository
{
  constructor() {
    super(NotificationModel, new NotificationMapper())
  }

  async findByRecipientId(
    recipientId: string,
    filter?: NotificationQueryFilter
  ): Promise<PaginatedNotificationResult> {
    const recipientObjectId = new Types.ObjectId(recipientId)
    const query: Record<string, unknown> = { recipientId: recipientObjectId, isDeleted: false }

    if (filter?.isRead !== undefined) {
      query.isRead = filter.isRead
    }

    if (filter?.type) {
      query.type = filter.type
    }

    const page = filter?.page && filter.page > 0 ? filter.page : 1
    const limit = filter?.limit && filter.limit > 0 ? filter.limit : 20
    const skip = (page - 1) * limit

    const [docs, total, unreadCount] = await Promise.all([
      this.model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.model.countDocuments(query).exec(),
      this.model
        .countDocuments({ recipientId: recipientObjectId, isRead: false, isDeleted: false })
        .exec(),
    ])

    return {
      notifications: docs.map((doc) => this.mapper.toDomain(doc)),
      total,
      unreadCount,
    }
  }

  async countUnreadByRecipientId(recipientId: string): Promise<number> {
    return this.model
      .countDocuments({
        recipientId: new Types.ObjectId(recipientId),
        isRead: false,
        isDeleted: false,
      })
      .exec()
  }

  async markAllAsReadByRecipientId(recipientId: string): Promise<number> {
    const result = await this.model
      .updateMany(
        { recipientId: new Types.ObjectId(recipientId), isRead: false, isDeleted: false },
        { $set: { isRead: true } }
      )
      .exec()

    return result.modifiedCount
  }

  async markAsRead(id: string, recipientId: string): Promise<Notification | null> {
    if (!Types.ObjectId.isValid(id)) return null

    const doc = await this.model
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          recipientId: new Types.ObjectId(recipientId),
          isDeleted: false,
        },
        { $set: { isRead: true } },
        { returnDocument: "after" }
      )
      .exec()

    return doc ? this.mapper.toDomain(doc) : null
  }

  async markAsActioned(id: string, recipientId: string): Promise<Notification | null> {
    if (!Types.ObjectId.isValid(id)) return null

    const doc = await this.model
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          recipientId: new Types.ObjectId(recipientId),
          isDeleted: false,
        },
        { $set: { isActioned: true } },
        { returnDocument: "after" }
      )
      .exec()

    return doc ? this.mapper.toDomain(doc) : null
  }

  async deleteByIdAndRecipientId(id: string, recipientId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false

    const result = await this.model
      .updateOne(
        {
          _id: new Types.ObjectId(id),
          recipientId: new Types.ObjectId(recipientId),
          isDeleted: false,
        },
        {
          $set: { isDeleted: true },
        }
      )
      .exec()

    return result.modifiedCount > 0
  }
}
