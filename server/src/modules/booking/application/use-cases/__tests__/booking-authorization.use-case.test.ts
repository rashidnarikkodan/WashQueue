import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Mocked } from "vitest"
import { CancelBookingUseCase } from "../cancel-booking.use-case"
import { GetBookingUseCase } from "../get-booking.use-case"
import { GetUserBookingsUseCase } from "../get-user-bookings.use-case"
import { IBookingRepository } from "../../../domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "../../../domain/repositories/booking-status-log.repository"
import { IBookingQueueService } from "@/modules/queue/application/interfaces/booking-queue.interface"
import { IBookingNotificationService } from "@/modules/notification/notification.module"
import { ITimeWindowRepository } from "@/modules/station/domain/repositories/time-window.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { IManagerAssignmentRepository } from "@/modules/manager/domain/repositories/manager-assignment.repository"
import { Station } from "@/modules/station/domain/entities/Station"
import {
  Booking,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
  ServiceType,
} from "../../../domain/entities/Booking"
import { AppError } from "@/common/errors/app-error"

describe("Booking Authorization and Capacity Release", () => {
  let bookingRepository: Mocked<IBookingRepository>
  let bookingStatusLogRepository: Mocked<IBookingStatusLogRepository>
  let queueService: Mocked<IBookingQueueService>
  let notificationService: Mocked<IBookingNotificationService>
  let timeWindowRepository: Mocked<ITimeWindowRepository>

  const createMockBooking = (userId: string = "user_victim") => {
    return new Booking({
      id: "booking_123",
      bookingNumber: "WQ-123456",
      userId,
      ownerId: "owner_1",
      stationId: "station_1",
      vehicleId: "vehicle_1",
      vehicleSnapshot: { vehicleCategoryId: "cat_1", vehicleClassId: "class_1" },
      serviceType: ServiceType.FULL,
      pricingSnapshot: {
        basePrice: 500,
        extraPrice: 0,
        totalPrice: 500,
        currency: "INR",
      },
      extraServices: [],
      scheduling: {
        timeWindowId: "window_slot_1",
        windowStart: new Date(),
        windowEnd: new Date(Date.now() + 3600000),
      },
      isWalkIn: false,
      createdByUserId: userId,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.ONLINE,
      depositAmount: 500,
      cashAmount: 0,
      refundAmount: 0,
      qr: {
        qrTokenHash: "hash123",
        qrExpiresAt: new Date(Date.now() + 86400000),
      },
      settlement: {
        platformCommission: 50,
        stationSettlement: 450,
      },
      status: BookingStatus.CONFIRMED,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  beforeEach(() => {
    bookingRepository = {
      findById: vi.fn(),
      findByBookingNumber: vi.fn(),
      findByQrTokenHash: vi.fn(),
      findBookings: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      updateWithStatusGuard: vi.fn(),
      countByStationAndStatus: vi.fn(),
      findNoShowCandidates: vi.fn(),
      getRefundDetails: vi.fn(),
      applyRefund: vi.fn(),
    }

    bookingStatusLogRepository = {
      save: vi.fn().mockResolvedValue({} as never),
      findByBookingId: vi.fn().mockResolvedValue([]),
    }

    queueService = {
      updateQueueStatus: vi.fn().mockResolvedValue(undefined),
      pushToStationQueue: vi.fn().mockResolvedValue(undefined),
      removeFromQueue: vi.fn().mockResolvedValue(undefined),
      getStationQueue: vi.fn().mockResolvedValue([]),
    } as unknown as Mocked<IBookingQueueService>

    notificationService = {
      notify: vi.fn().mockResolvedValue(undefined),
    }

    timeWindowRepository = {
      findById: vi.fn(),
      findByStationIdAndDate: vi.fn(),
      findByStationIdAndDateRange: vi.fn(),
      save: vi.fn(),
      saveMany: vi.fn(),
      deleteUnbookedFutureWindows: vi.fn(),
      reserveCapacityAtomically: vi.fn(),
      reserveWalkInCapacityAtomically: vi.fn(),
      releaseCapacityAtomically: vi.fn().mockResolvedValue(true),
    } as unknown as Mocked<ITimeWindowRepository>
  })

  describe("CancelBookingUseCase authorization and slot release", () => {
    it("should prevent a customer from cancelling another customer's booking", async () => {
      const mockBooking = createMockBooking("user_victim")
      bookingRepository.findById.mockResolvedValue(mockBooking)

      const useCase = new CancelBookingUseCase(
        bookingRepository,
        bookingStatusLogRepository,
        queueService,
        notificationService,
        undefined,
        undefined,
        timeWindowRepository
      )

      await expect(
        useCase.execute(
          "attacker_user",
          { bookingId: "booking_123", reason: "Malicious cancellation" },
          "CUSTOMER"
        )
      ).rejects.toThrow(/You are not authorized to cancel this booking/)

      expect(timeWindowRepository.releaseCapacityAtomically).not.toHaveBeenCalled()
    })

    it("should allow a customer to cancel their own booking and release time window slot capacity", async () => {
      const mockBooking = createMockBooking("user_customer")
      bookingRepository.findById.mockResolvedValue(mockBooking)
      bookingRepository.updateWithStatusGuard.mockResolvedValue(mockBooking)

      const useCase = new CancelBookingUseCase(
        bookingRepository,
        bookingStatusLogRepository,
        queueService,
        notificationService,
        undefined,
        undefined,
        timeWindowRepository
      )

      const result = await useCase.execute(
        "user_customer",
        { bookingId: "booking_123", reason: "Change of plans" },
        "CUSTOMER"
      )

      expect(result.id).toBe("booking_123")
      expect(timeWindowRepository.releaseCapacityAtomically).toHaveBeenCalledWith("window_slot_1")
    })

    it("should allow staff (MANAGER/OWNER/ADMIN) to cancel a booking", async () => {
      const mockBooking = createMockBooking("user_customer")
      bookingRepository.findById.mockResolvedValue(mockBooking)
      bookingRepository.updateWithStatusGuard.mockResolvedValue(mockBooking)

      const useCase = new CancelBookingUseCase(
        bookingRepository,
        bookingStatusLogRepository,
        queueService,
        notificationService,
        undefined,
        undefined,
        timeWindowRepository
      )

      const result = await useCase.execute(
        "manager_user",
        { bookingId: "booking_123", reason: "Station maintenance" },
        "MANAGER"
      )

      expect(result.id).toBe("booking_123")
      expect(timeWindowRepository.releaseCapacityAtomically).toHaveBeenCalledWith("window_slot_1")
    })
  })

  describe("GetBookingUseCase authorization", () => {
    it("should reject customer viewing another customer's booking", async () => {
      const mockBooking = createMockBooking("user_victim")
      bookingRepository.findById.mockResolvedValue(mockBooking)

      const useCase = new GetBookingUseCase(bookingRepository, bookingStatusLogRepository)

      await expect(useCase.execute("booking_123", "attacker_user", "CUSTOMER")).rejects.toThrow(
        AppError
      )
    })

    it("should allow customer viewing their own booking", async () => {
      const mockBooking = createMockBooking("user_customer")
      bookingRepository.findById.mockResolvedValue(mockBooking)

      const useCase = new GetBookingUseCase(bookingRepository, bookingStatusLogRepository)

      const result = await useCase.execute("booking_123", "user_customer", "CUSTOMER")
      expect(result.id).toBe("booking_123")
    })
  })

  describe("GetUserBookingsUseCase authorization and station scoping", () => {
    let stationRepository: Mocked<IStationRepository>
    let managerAssignmentRepository: Mocked<IManagerAssignmentRepository>

    beforeEach(() => {
      stationRepository = {
        findById: vi.fn(),
        findByIds: vi.fn(),
        findByName: vi.fn(),
        findByOwnerId: vi.fn(),
        findByManagerId: vi.fn(),
        setManagerId: vi.fn(),
        findStationManagedByOwner: vi.fn(),
        findNearby: vi.fn(),
        findWithFilter: vi.fn(),
        find: vi.fn(),
        save: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
        countByStatus: vi.fn(),
        getStatusCounts: vi.fn(),
        updateStatus: vi.fn(),
        updateOperatingHours: vi.fn(),
        updateLocation: vi.fn(),
        updateSlotConfig: vi.fn(),
        updateImages: vi.fn(),
        addHoliday: vi.fn(),
        removeHoliday: vi.fn(),
        toggleActive: vi.fn(),
        updateRating: vi.fn(),
      } as unknown as Mocked<IStationRepository>

      managerAssignmentRepository = {
        save: vi.fn(),
        findById: vi.fn(),
        findByStationId: vi.fn(),
        findByUserId: vi.fn(),
        findByOwnerId: vi.fn(),
        findActiveByStationId: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      } as unknown as Mocked<IManagerAssignmentRepository>

      bookingRepository.findBookings.mockResolvedValue({
        bookings: [createMockBooking("user_customer")],
        total: 1,
      })
    })

    it("should query bookings across all owned stations when OWNER requests stationId: 'ALL'", async () => {
      stationRepository.findByOwnerId.mockResolvedValue([
        { id: "station_1" } as Station,
        { id: "station_2" } as Station,
      ])

      const useCase = new GetUserBookingsUseCase(
        bookingRepository,
        managerAssignmentRepository,
        stationRepository
      )

      const result = await useCase.execute("owner_user_id", { stationId: "ALL" }, "OWNER")

      expect(stationRepository.findByOwnerId).toHaveBeenCalledWith("owner_user_id")
      expect(bookingRepository.findBookings).toHaveBeenCalledWith(
        expect.objectContaining({
          stationIds: ["station_1", "station_2"],
        })
      )
      expect(bookingRepository.findBookings).not.toHaveBeenCalledWith(
        expect.objectContaining({
          stationId: "ALL",
        })
      )
      expect(result.bookings).toHaveLength(1)
      expect(result.pagination.total).toBe(1)
    })

    it("should query bookings for a specific station when OWNER requests an owned stationId", async () => {
      stationRepository.findByOwnerId.mockResolvedValue([
        { id: "station_1" } as Station,
        { id: "station_2" } as Station,
      ])

      const useCase = new GetUserBookingsUseCase(
        bookingRepository,
        managerAssignmentRepository,
        stationRepository
      )

      const result = await useCase.execute("owner_user_id", { stationId: "station_1" }, "OWNER")

      expect(bookingRepository.findBookings).toHaveBeenCalledWith(
        expect.objectContaining({
          stationIds: ["station_1"],
        })
      )
      expect(result.bookings).toHaveLength(1)
    })

    it("should return empty bookings if OWNER requests a station they do not own", async () => {
      stationRepository.findByOwnerId.mockResolvedValue([{ id: "station_1" } as Station])

      const useCase = new GetUserBookingsUseCase(
        bookingRepository,
        managerAssignmentRepository,
        stationRepository
      )

      const result = await useCase.execute(
        "owner_user_id",
        { stationId: "station_unowned" },
        "OWNER"
      )

      expect(bookingRepository.findBookings).not.toHaveBeenCalled()
      expect(result.bookings).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
    })

    it("should return empty bookings if OWNER has no registered stations", async () => {
      stationRepository.findByOwnerId.mockResolvedValue([])

      const useCase = new GetUserBookingsUseCase(
        bookingRepository,
        managerAssignmentRepository,
        stationRepository
      )

      const result = await useCase.execute("owner_user_id", { stationId: "ALL" }, "OWNER")

      expect(bookingRepository.findBookings).not.toHaveBeenCalled()
      expect(result.bookings).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
    })
  })
})
