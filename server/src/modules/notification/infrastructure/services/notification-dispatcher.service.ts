import logger from "@/configs/logger.config"
import { SocketServerService } from "@/infrastructure/websocket/socket-server.service"
import { Notification } from "../../domain/entities/Notification"
import { INotificationRepository } from "../../domain/repositories/notification.repository.interface"

import { User as UserModel } from "@/modules/user/infrastructure/model/user.model"
import { ROLE } from "@/common/constants/role.constants"
import { StationModel } from "@/modules/station/infrastructure/models/station.model"
import { Owner as OwnerModel } from "@/modules/owner/infrastructure/model/owner.model"
import { ManagerAssignmentModel } from "@/modules/manager/infrastructure/models/manager-assignment.model"
import {
  INotificationDispatcherService,
  DispatchNotificationOptions,
  DispatchStationStakeholdersOptions,
} from "../../application/interfaces/notification-services.interface"

export type { DispatchNotificationOptions, DispatchStationStakeholdersOptions }

export class NotificationDispatcherService implements INotificationDispatcherService {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  // Dispatches a single persistent notification to a specific recipient and emits a real-time WebSocket event.
  async dispatch(options: DispatchNotificationOptions): Promise<Notification | null> {
    try {
      if (!options.recipientId) {
        logger.warn(
          { options },
          "[NotificationDispatcher] Cannot dispatch notification: missing recipientId"
        )
        return null
      }

      const stringifiedData =
        typeof options.data === "object" ? JSON.stringify(options.data) : options.data || "{}"

      const now = new Date()
      const expiresAt = options.expiresAt || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      const notification = new Notification({
        id: "",
        recipientId: options.recipientId,
        senderId: options.senderId,
        type: options.type,
        title: options.title,
        channel: options.channel || "IN_APP",
        actionType: options.actionType || "NONE",
        message: options.message,
        data: stringifiedData,
        isRead: false,
        isActioned: false,
        createdAt: now,
        expiresAt,
      })

      const saved = await this.notificationRepository.save(notification)

      // Emit real-time WebSocket event to the recipient
      try {
        const socketService = SocketServerService.getInstance()
        socketService.emitToUser(options.recipientId, "NOTIFICATION_RECEIVED", saved.data)
      } catch (socketErr) {
        logger.warn(
          { socketErr, recipientId: options.recipientId },
          "[NotificationDispatcher] Failed to emit WebSocket notification event"
        )
      }

      logger.info(
        {
          notificationId: saved.id,
          recipientId: saved.recipientId,
          type: saved.type,
          title: saved.title,
        },
        "[NotificationDispatcher] Successfully dispatched and persisted notification"
      )

      return saved
    } catch (error) {
      logger.error({ error, options }, "[NotificationDispatcher] Failed to dispatch notification")
      return null
    }
  }

  // Dispatches notifications to multiple recipients in parallel.
  async dispatchToUsers(
    recipientIds: string[],
    options: Omit<DispatchNotificationOptions, "recipientId">
  ): Promise<Notification[]> {
    const uniqueIds = Array.from(new Set(recipientIds.filter(Boolean)))
    const results = await Promise.all(
      uniqueIds.map((recipientId) =>
        this.dispatch({
          ...options,
          recipientId,
        })
      )
    )
    return results.filter((n): n is Notification => n !== null)
  }

  // Dispatches a notification to all administrators in the system.
  async dispatchToAdmins(
    options: Omit<DispatchNotificationOptions, "recipientId">
  ): Promise<Notification[]> {
    try {
      const adminDocs = await UserModel.find({ role: ROLE.ADMIN, isBlocked: false })
        .select("_id")
        .lean()
        .exec()

      const adminIds = adminDocs.map((doc) => doc._id.toString())
      if (adminIds.length === 0) return []

      return await this.dispatchToUsers(adminIds, options)
    } catch (error) {
      logger.error({ error }, "[NotificationDispatcher] Failed to dispatch to admins")
      return []
    }
  }

  // Dispatches notifications to stakeholders of a station (Owner and/or active Managers).
  async dispatchToStationStakeholders(options: DispatchStationStakeholdersOptions): Promise<void> {
    try {
      const {
        stationId,
        notifyOwner = true,
        notifyManagers = true,
        ownerPayload,
        managerPayload,
        defaultPayload,
      } = options

      const stationDoc = await StationModel.findById(stationId).lean().exec()
      if (!stationDoc) {
        logger.warn(
          { stationId },
          "[NotificationDispatcher] Station not found for stakeholder dispatch"
        )
        return
      }

      const promises: Promise<unknown>[] = []

      // 1. Notify Station Owner
      if (notifyOwner && stationDoc.ownerId) {
        let ownerUserId = stationDoc.ownerId.toString()
        const ownerDoc = await OwnerModel.findById(stationDoc.ownerId).lean().exec()
        if (ownerDoc && ownerDoc.userId) {
          ownerUserId = ownerDoc.userId.toString()
        }

        const payload: DispatchNotificationOptions = {
          ...defaultPayload,
          ...ownerPayload,
          recipientId: ownerUserId,
          data: {
            stationId: stationDoc._id.toString(),
            stationName: stationDoc.name,
            ...(typeof defaultPayload.data === "object" ? defaultPayload.data : {}),
            ...(typeof ownerPayload?.data === "object" ? ownerPayload.data : {}),
          },
        }
        promises.push(this.dispatch(payload))
      }

      // 2. Notify Active Station Managers
      if (notifyManagers) {
        const managerAssignments = await ManagerAssignmentModel.find({
          stationId: stationDoc._id,
          status: "ACTIVE",
        })
          .select("managerUserId")
          .lean()
          .exec()

        const managerUserIds = managerAssignments.map((a) => a.managerUserId.toString())
        if (managerUserIds.length > 0) {
          const payloadOptions: Omit<DispatchNotificationOptions, "recipientId"> = {
            ...defaultPayload,
            ...managerPayload,
            data: {
              stationId: stationDoc._id.toString(),
              stationName: stationDoc.name,
              ...(typeof defaultPayload.data === "object" ? defaultPayload.data : {}),
              ...(typeof managerPayload?.data === "object" ? managerPayload.data : {}),
            },
          }
          promises.push(this.dispatchToUsers(managerUserIds, payloadOptions))
        }
      }

      await Promise.all(promises)
    } catch (error) {
      logger.error(
        { error, stationId: options.stationId },
        "[NotificationDispatcher] Failed to dispatch to station stakeholders"
      )
    }
  }
}
