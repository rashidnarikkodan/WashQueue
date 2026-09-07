import { describe, it, expect, vi, beforeEach } from "vitest"
import { Notification } from "../domain/entities/Notification"
import { INotificationRepository } from "../domain/repositories/notification.repository.interface"
import { CreateNotificationUseCase } from "../application/use-cases/create-notification.use-case"
import { GetNotificationsUseCase } from "../application/use-cases/get-notifications.use-case"
import { MarkNotificationAsReadUseCase } from "../application/use-cases/mark-read.use-case"
import { MarkNotificationAsActionedUseCase } from "../application/use-cases/mark-actioned.use-case"
import { DeleteNotificationUseCase } from "../application/use-cases/delete-notification.use-case"
import { GetUnreadNotificationCountUseCase } from "../application/use-cases/get-unread-notification-count.use-case"
import {
  Booking,
  BookingStatus,
  PaymentStatus,
  PaymentMethod,
  ServiceType,
} from "@/modules/booking/domain/entities/Booking"
import { IMailService } from "@/core/application/interfaces/mail.interface"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { BookingNotificationService } from "../infrastructure/services/booking-notification.service"
import { User } from "@/modules/user/domain/entities/User"
import { ROLE } from "@/common/constants/role.constants"

describe("Notification Module Unit Tests", () => {
  let mockRepo: INotificationRepository

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      findByRecipientId: vi.fn(),
      countUnreadByRecipientId: vi.fn(),
      markAllAsReadByRecipientId: vi.fn(),
      markAsRead: vi.fn(),
      markAsActioned: vi.fn(),
      deleteByIdAndRecipientId: vi.fn(),
    }
  })

  describe("Notification Entity", () => {
    it("should create entity and toggle read and actioned state", () => {
      const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      const notification = new Notification({
        id: "notif-123",
        recipientId: "user-456",
        type: "BOOKING",
        title: "Booking Confirmed",
        channel: "IN_APP",
        actionType: "NAVIGATE",
        message: "Your car wash is confirmed",
        data: JSON.stringify({ bookingId: "b-1" }),
        isRead: false,
        isActioned: false,
        createdAt: new Date(),
        expiresAt: expiry,
      })

      expect(notification.isRead).toBe(false)
      expect(notification.isActioned).toBe(false)
      expect(notification.isDeleted).toBe(false)
      expect(notification.expiresAt).toEqual(expiry)

      notification.markAsRead()
      expect(notification.isRead).toBe(true)

      notification.markAsActioned()
      expect(notification.isActioned).toBe(true)

      notification.softDelete()
      expect(notification.isDeleted).toBe(true)
    })
  })

  describe("CreateNotificationUseCase", () => {
    it("should save and return notification response with 1 month expiresAt", async () => {
      vi.mocked(mockRepo.save).mockImplementation(async (entity) => entity)

      const useCase = new CreateNotificationUseCase(mockRepo)
      const before = Date.now()
      const result = await useCase.execute({
        recipientId: "user-1",
        senderId: "admin-999",
        type: "QUEUE",
        title: "Position Update",
        message: "You are #2 in line",
        data: { queuePosition: 2 },
      })

      expect(result.type).toBe("QUEUE")
      expect(result.senderId).toBe("admin-999")
      expect(result.expiresAt).toBeDefined()
      const expectedMin = before + 29 * 24 * 60 * 60 * 1000
      const expectedMax = Date.now() + 31 * 24 * 60 * 60 * 1000
      expect(result.expiresAt!.getTime()).toBeGreaterThanOrEqual(expectedMin)
      expect(result.expiresAt!.getTime()).toBeLessThanOrEqual(expectedMax)
      expect(mockRepo.save).toHaveBeenCalledTimes(1)
    })
  })

  describe("GetNotificationsUseCase", () => {
    it("should return paginated notifications", async () => {
      const notif = new Notification({
        id: "notif-1",
        recipientId: "user-1",
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

      vi.mocked(mockRepo.findByRecipientId).mockResolvedValue({
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
        recipientId: "user-1",
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
        recipientId: "user-1",
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
      vi.mocked(mockRepo.countUnreadByRecipientId).mockResolvedValue(5)

      const useCase = new GetUnreadNotificationCountUseCase(mockRepo)
      const result = await useCase.execute("user-1")

      expect(result.unreadCount).toBe(5)
      expect(mockRepo.countUnreadByRecipientId).toHaveBeenCalledWith("user-1")
    })
  })

  describe("DeleteNotificationUseCase", () => {
    it("should delete notification", async () => {
      vi.mocked(mockRepo.deleteByIdAndRecipientId).mockResolvedValue(true)

      const useCase = new DeleteNotificationUseCase(mockRepo)
      await expect(useCase.execute("notif-1", "user-1")).resolves.toBeUndefined()
      expect(mockRepo.deleteByIdAndRecipientId).toHaveBeenCalledWith("notif-1", "user-1")
    })
  })

  describe("NotificationDispatcherService & BookingNotificationService", () => {
    it("should dispatch persistent notification and emit socket event", async () => {
      const { NotificationDispatcherService } =
        await import("../infrastructure/services/notification-dispatcher.service")
      const dispatcher = new NotificationDispatcherService(mockRepo)

      vi.mocked(mockRepo.save).mockImplementation(async (entity) => entity)

      const dispatched = await dispatcher.dispatch({
        recipientId: "user-999",
        type: "BOOKING",
        title: "Test Booking Confirmed",
        message: "Your booking is ready",
        data: { bookingId: "b-123" },
      })

      expect(dispatched).toBeDefined()
      expect(dispatched?.recipientId).toBe("user-999")
      expect(dispatched?.title).toBe("Test Booking Confirmed")
      expect(mockRepo.save).toHaveBeenCalled()
    })

    it("should send booking confirmation and payment receipt emails via BookingNotificationService", async () => {
      const mockMailService: IMailService = {
        sendVerificationEmail: vi.fn(),
        sendForgotPasswordEmail: vi.fn(),
        sendOwnerApprovalEmail: vi.fn(),
        sendOwnerRejectionEmail: vi.fn(),
        sendManagerInvitationEmail: vi.fn(),
        sendBookingConfirmationEmail: vi.fn(),
        sendPaymentReceiptEmail: vi.fn(),
        sendBookingCancellationEmail: vi.fn(),
      }

      const mockUser = new User({
        id: "u-1",
        name: "Jane Customer",
        email: "jane@example.com",
        role: ROLE.CUSTOMER,
      })

      const mockUserRepo = {
        findById: vi.fn().mockResolvedValue(mockUser),
      } as unknown as IUserRepository

      const mockStationRepo = {
        findById: vi.fn().mockResolvedValue({ id: "st-1", name: "Metro Auto Wash" }),
      } as unknown as IStationRepository

      const service = new BookingNotificationService(
        undefined,
        mockMailService,
        mockUserRepo,
        mockStationRepo
      )

      const mockBooking = new Booking({
        id: "bk-123",
        bookingNumber: "WQ-7890",
        userId: "u-1",
        ownerId: "own-1",
        stationId: "st-1",
        vehicleId: "v-1",
        vehicleSnapshot: {
          vehicleCategoryId: "cat-1",
          vehicleClassId: "cls-1",
        },
        serviceType: ServiceType.FULL,
        pricingSnapshot: {
          basePrice: 300,
          extraPrice: 0,
          totalPrice: 300,
          currency: "INR",
        },
        extraServices: [],
        paymentMethod: PaymentMethod.WALLET,
        paymentStatus: PaymentStatus.PAID,
        depositAmount: 300,
        cashAmount: 0,
        refundAmount: 0,
        settlement: { platformCommission: 30, stationSettlement: 270 },
        status: BookingStatus.CONFIRMED,
        isWalkIn: false,
        createdByUserId: "u-1",
        qr: {
          qrTokenHash: "hash-123",
          qrExpiresAt: new Date(Date.now() + 3600000),
        },
        scheduling: {
          timeWindowId: "tw-1",
          windowStart: new Date("2026-09-10T10:00:00Z"),
          windowEnd: new Date("2026-09-10T10:30:00Z"),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await service.notify("BOOKING_CREATED", mockBooking)

      expect(mockMailService.sendBookingConfirmationEmail).toHaveBeenCalledWith(
        "jane@example.com",
        expect.objectContaining({
          customerName: "Jane Customer",
          bookingNumber: "WQ-7890",
          stationName: "Metro Auto Wash",
          serviceType: ServiceType.FULL,
          totalAmount: 300,
        })
      )

      expect(mockMailService.sendPaymentReceiptEmail).toHaveBeenCalledWith(
        "jane@example.com",
        expect.objectContaining({
          customerName: "Jane Customer",
          amount: 300,
          description: "FULL at Metro Auto Wash",
        })
      )
    })

    it("should send booking cancellation & refund email via BookingNotificationService", async () => {
      const mockMailService: IMailService = {
        sendVerificationEmail: vi.fn(),
        sendForgotPasswordEmail: vi.fn(),
        sendOwnerApprovalEmail: vi.fn(),
        sendOwnerRejectionEmail: vi.fn(),
        sendManagerInvitationEmail: vi.fn(),
        sendBookingConfirmationEmail: vi.fn(),
        sendPaymentReceiptEmail: vi.fn(),
        sendBookingCancellationEmail: vi.fn(),
      }

      const mockUser = new User({
        id: "u-1",
        name: "Jane Customer",
        email: "jane@example.com",
        role: ROLE.CUSTOMER,
      })

      const mockUserRepo = {
        findById: vi.fn().mockResolvedValue(mockUser),
      } as unknown as IUserRepository

      const mockStationRepo = {
        findById: vi.fn().mockResolvedValue({ id: "st-1", name: "Metro Auto Wash" }),
      } as unknown as IStationRepository

      const service = new BookingNotificationService(
        undefined,
        mockMailService,
        mockUserRepo,
        mockStationRepo
      )

      const mockBooking = new Booking({
        id: "bk-123",
        bookingNumber: "WQ-7890",
        userId: "u-1",
        ownerId: "own-1",
        stationId: "st-1",
        vehicleId: "v-1",
        vehicleSnapshot: {
          vehicleCategoryId: "cat-1",
          vehicleClassId: "cls-1",
        },
        serviceType: ServiceType.FULL,
        pricingSnapshot: {
          basePrice: 300,
          extraPrice: 0,
          totalPrice: 300,
          currency: "INR",
        },
        extraServices: [],
        paymentMethod: PaymentMethod.WALLET,
        paymentStatus: PaymentStatus.REFUNDED,
        depositAmount: 300,
        cashAmount: 0,
        refundAmount: 300,
        settlement: { platformCommission: 30, stationSettlement: 270 },
        status: BookingStatus.CANCELLED,
        isWalkIn: false,
        createdByUserId: "u-1",
        qr: {
          qrTokenHash: "hash-123",
          qrExpiresAt: new Date(Date.now() + 3600000),
        },
        scheduling: {
          timeWindowId: "tw-1",
          windowStart: new Date("2026-09-10T10:00:00Z"),
          windowEnd: new Date("2026-09-10T10:30:00Z"),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await service.notify("BOOKING_CANCELLED", mockBooking, {
        refundAmount: 300,
        reason: "Customer schedule changed",
      })

      expect(mockMailService.sendBookingCancellationEmail).toHaveBeenCalledWith(
        "jane@example.com",
        expect.objectContaining({
          customerName: "Jane Customer",
          bookingNumber: "WQ-7890",
          stationName: "Metro Auto Wash",
          refundAmount: 300,
          reason: "Customer schedule changed",
        })
      )
    })
  })
})
