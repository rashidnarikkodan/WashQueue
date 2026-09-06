import { describe, it, expect, vi, beforeEach } from "vitest"
import { Notification } from "../domain/entities/Notification"
import { INotificationRepository } from "../domain/repositories/notification.repository.interface"
import { CreateNotificationUseCase } from "../application/use-cases/create-notification.use-case"
import { GetNotificationsUseCase } from "../application/use-cases/get-notifications.use-case"
import { MarkNotificationAsReadUseCase } from "../application/use-cases/mark-notification-as-read.use-case"
import { MarkNotificationAsActionedUseCase } from "../application/use-cases/mark-notification-as-actioned.use-case"
import { DeleteNotificationUseCase } from "../application/use-cases/delete-notification.use-case"
import { GetUnreadNotificationCountUseCase } from "../application/use-cases/get-unread-notification-count.use-case"

describe("Notification Module Unit Tests", () => {
  let mockRepo: INotificationRepository

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      findByUserId: vi.fn(),
      countUnreadByUserId: vi.fn(),
      markAllAsReadByUserId: vi.fn(),
      markAsRead: vi.fn(),
      markAsActioned: vi.fn(),
      deleteByIdAndUserId: vi.fn(),
    }
  })

  describe("Notification Entity", () => {
    it("should create entity and toggle read and actioned state", () => {
      const notification = new Notification({
        id: "notif-123",
        userId: "user-456",
        type: "BOOKING",
        title: "Booking Confirmed",
        channel: "IN_APP",
        actionType: "NAVIGATE",
        message: "Your car wash is confirmed",
        data: JSON.stringify({ bookingId: "b-1" }),
        isRead: false,
        isActioned: false,
        createdAt: new Date(),
      })

      expect(notification.isRead).toBe(false)
      expect(notification.isActioned).toBe(false)
      expect(notification.isDeleted).toBe(false)

      notification.markAsRead()
      expect(notification.isRead).toBe(true)

      notification.markAsActioned()
      expect(notification.isActioned).toBe(true)

      notification.softDelete()
      expect(notification.isDeleted).toBe(true)
    })
  })

  describe("CreateNotificationUseCase", () => {
    it("should save and return notification response", async () => {
      const createdEntity = new Notification({
        id: "notif-1",
        userId: "user-1",
        type: "QUEUE",
        title: "Position Update",
        channel: "IN_APP",
        actionType: "NONE",
        message: "You are #2 in line",
        data: JSON.stringify({ queuePosition: 2 }),
        isRead: false,
        isActioned: false,
        createdAt: new Date(),
      })

      vi.mocked(mockRepo.save).mockResolvedValue(createdEntity)

      const useCase = new CreateNotificationUseCase(mockRepo)
      const result = await useCase.execute({
        userId: "user-1",
        type: "QUEUE",
        title: "Position Update",
        message: "You are #2 in line",
        data: { queuePosition: 2 },
      })

      expect(result.id).toBe("notif-1")
      expect(result.type).toBe("QUEUE")
      expect(mockRepo.save).toHaveBeenCalledTimes(1)
    })
  })

  describe("GetNotificationsUseCase", () => {
    it("should return paginated notifications", async () => {
      const notif = new Notification({
        id: "notif-1",
        userId: "user-1",
        type: "PAYMENT",
        title: "Payment Received",
        channel: "IN_APP",
        actionType: "NONE",
        message: "Paid $25",
        data: "{}",
        isRead: false,
        isActioned: false,
        createdAt: new Date(),
      })

      vi.mocked(mockRepo.findByUserId).mockResolvedValue({
        notifications: [notif],
        total: 1,
        unreadCount: 1,
      })

      const useCase = new GetNotificationsUseCase(mockRepo)
      const result = await useCase.execute("user-1", { page: 1, limit: 10 })

      expect(result.total).toBe(1)
      expect(result.items.length).toBe(1)
      expect(result.unreadCount).toBe(1)
    })
  })

  describe("MarkNotificationAsReadUseCase", () => {
    it("should mark notification as read", async () => {
      const notif = new Notification({
        id: "notif-1",
        userId: "user-1",
        type: "SYSTEM",
        title: "Maintenance",
        channel: "IN_APP",
        actionType: "NONE",
        message: "Scheduled maintenance",
        data: "{}",
        isRead: true,
        isActioned: false,
        createdAt: new Date(),
      })

      vi.mocked(mockRepo.markAsRead).mockResolvedValue(notif)

      const useCase = new MarkNotificationAsReadUseCase(mockRepo)
      const result = await useCase.execute("notif-1", "user-1")

      expect(result.isRead).toBe(true)
      expect(mockRepo.markAsRead).toHaveBeenCalledWith("notif-1", "user-1")
    })
  })

  describe("MarkNotificationAsActionedUseCase", () => {
    it("should mark notification as actioned", async () => {
      const notif = new Notification({
        id: "notif-1",
        userId: "user-1",
        type: "SYSTEM",
        title: "Maintenance",
        channel: "IN_APP",
        actionType: "NAVIGATE",
        message: "Scheduled maintenance",
        data: "{}",
        isRead: true,
        isActioned: true,
        createdAt: new Date(),
      })

      vi.mocked(mockRepo.markAsActioned).mockResolvedValue(notif)

      const useCase = new MarkNotificationAsActionedUseCase(mockRepo)
      const result = await useCase.execute("notif-1", "user-1")

      expect(result.isActioned).toBe(true)
      expect(mockRepo.markAsActioned).toHaveBeenCalledWith("notif-1", "user-1")
    })
  })

  describe("GetUnreadNotificationCountUseCase", () => {
    it("should return unread count", async () => {
      vi.mocked(mockRepo.countUnreadByUserId).mockResolvedValue(5)

      const useCase = new GetUnreadNotificationCountUseCase(mockRepo)
      const result = await useCase.execute("user-1")

      expect(result.unreadCount).toBe(5)
      expect(mockRepo.countUnreadByUserId).toHaveBeenCalledWith("user-1")
    })
  })

  describe("DeleteNotificationUseCase", () => {
    it("should delete notification", async () => {
      vi.mocked(mockRepo.deleteByIdAndUserId).mockResolvedValue(true)

      const useCase = new DeleteNotificationUseCase(mockRepo)
      await expect(useCase.execute("notif-1", "user-1")).resolves.toBeUndefined()
      expect(mockRepo.deleteByIdAndUserId).toHaveBeenCalledWith("notif-1", "user-1")
    })
  })
})
