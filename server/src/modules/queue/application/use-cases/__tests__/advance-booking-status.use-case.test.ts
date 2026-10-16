import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Mocked } from "vitest"
import { AdvanceBookingStatusUseCase } from "../advance-booking-status.use-case"
import { IBookingRepository } from "@/modules/booking/domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "@/modules/booking/domain/repositories/booking-status-log.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { IManagerAssignmentRepository } from "@/modules/manager/domain/repositories/manager-assignment.repository"
import { ITimeWindowRepository } from "@/modules/station/domain/repositories/time-window.repository"
import { IBookingNotificationService } from "@/modules/notification/notification.module"
import {
  IStartServiceUseCase,
  ICompleteHandoverUseCase,
} from "../../interfaces/queue-usecases.interface"
import { Station } from "@/modules/station/domain/entities/Station"
import {
  Booking,
  BookingStatus,
  BookingProps,
  ServiceType,
  PaymentStatus,
  PaymentMethod,
} from "@/modules/booking/domain/entities/Booking"
import { BookingResponseDTO } from "@/modules/booking/application/dtos/booking-response.dto"
import { AppError } from "@/common/errors/app-error"

describe("AdvanceBookingStatusUseCase", () => {
  let bookingRepository: Mocked<IBookingRepository>
  let bookingStatusLogRepository: Mocked<IBookingStatusLogRepository>
  let stationRepository: Mocked<IStationRepository>
  let managerAssignmentRepository: Mocked<IManagerAssignmentRepository>
  let startServiceUseCase: Mocked<IStartServiceUseCase>
  let completeHandoverUseCase: Mocked<ICompleteHandoverUseCase>
  let timeWindowRepository: Mocked<ITimeWindowRepository>
  let notificationService: Mocked<IBookingNotificationService>
  let useCase: AdvanceBookingStatusUseCase

  const createMockBooking = (status: BookingStatus = BookingStatus.CHECKED_IN): Booking => {
    return new Booking({
      id: "booking_1",
      bookingNumber: "WQ-1111",
      userId: "user_customer",
      ownerId: "owner_user",
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
      scheduling: {
        timeWindowId: "window_1",
        windowStart: new Date(),
        windowEnd: new Date(),
      },
      status,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.ONLINE,
      qr: {
        qrTokenHash: "hash_123",
        qrExpiresAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as BookingProps)
  }

  const createMockStation = (): Station => {
    return {
      id: "station_1",
      ownerId: "owner_user",
      getProps: () => ({
        id: "station_1",
        ownerId: "owner_user",
      }),
    } as unknown as Station
  }

  beforeEach(() => {
    vi.clearAllMocks()
    bookingRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    } as unknown as Mocked<IBookingRepository>

    bookingStatusLogRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findByBookingId: vi.fn().mockResolvedValue([]),
    } as unknown as Mocked<IBookingStatusLogRepository>

    stationRepository = {
      findById: vi.fn().mockResolvedValue(createMockStation()),
    } as unknown as Mocked<IStationRepository>

    managerAssignmentRepository = {
      findByUserAndStation: vi.fn().mockResolvedValue(null),
    } as unknown as Mocked<IManagerAssignmentRepository>

    startServiceUseCase = {
      execute: vi.fn(),
    } as unknown as Mocked<IStartServiceUseCase>

    completeHandoverUseCase = {
      execute: vi.fn(),
    } as unknown as Mocked<ICompleteHandoverUseCase>

    timeWindowRepository = {
      releaseCapacityAtomically: vi.fn().mockResolvedValue(true),
    } as unknown as Mocked<ITimeWindowRepository>

    notificationService = {
      notify: vi.fn().mockResolvedValue(undefined),
    } as unknown as Mocked<IBookingNotificationService>

    useCase = new AdvanceBookingStatusUseCase(
      bookingRepository,
      bookingStatusLogRepository,
      stationRepository,
      managerAssignmentRepository,
      startServiceUseCase,
      completeHandoverUseCase,
      timeWindowRepository,
      notificationService
    )
  })

  it("should delegate to startServiceUseCase when targetStatus is IN_SERVICE", async () => {
    const mockDTO = {
      id: "booking_1",
      status: BookingStatus.IN_SERVICE,
    } as unknown as BookingResponseDTO
    startServiceUseCase.execute.mockResolvedValue(mockDTO)

    const result = await useCase.execute("owner_user", {
      bookingId: "booking_1",
      targetStatus: BookingStatus.IN_SERVICE,
    })

    expect(startServiceUseCase.execute).toHaveBeenCalledWith("owner_user", "booking_1")
    expect(result).toBe(mockDTO)
  })

  it("should delegate to completeHandoverUseCase when targetStatus is COMPLETED and booking is in SERVICE_COMPLETED", async () => {
    const mockBooking = createMockBooking(BookingStatus.SERVICE_COMPLETED)
    bookingRepository.findById.mockResolvedValue(mockBooking)
    const mockDTO = {
      id: "booking_1",
      status: BookingStatus.COMPLETED,
    } as unknown as BookingResponseDTO
    completeHandoverUseCase.execute.mockResolvedValue(mockDTO)

    const result = await useCase.execute("owner_user", {
      bookingId: "booking_1",
      targetStatus: BookingStatus.COMPLETED,
      reason: "Handed over to customer",
    })

    expect(completeHandoverUseCase.execute).toHaveBeenCalledWith(
      "owner_user",
      "booking_1",
      "Handed over to customer"
    )
    expect(result).toBe(mockDTO)
  })

  it("should throw error if booking is not found", async () => {
    bookingRepository.findById.mockResolvedValue(null)

    await expect(
      useCase.execute("owner_user", {
        bookingId: "non_existent",
        targetStatus: BookingStatus.NO_SHOW,
      })
    ).rejects.toThrow(AppError)
  })

  it("should mark booking as NO_SHOW and release time window capacity", async () => {
    const mockBooking = createMockBooking(BookingStatus.CONFIRMED)
    bookingRepository.findById.mockResolvedValue(mockBooking)
    bookingRepository.update.mockImplementation(async (b) => b)

    const result = await useCase.execute("owner_user", {
      bookingId: "booking_1",
      targetStatus: BookingStatus.NO_SHOW,
      reason: "Customer did not arrive",
    })

    expect(result.status).toBe(BookingStatus.NO_SHOW)
    expect(timeWindowRepository.releaseCapacityAtomically).toHaveBeenCalledWith("window_1")
    expect(bookingStatusLogRepository.save).toHaveBeenCalled()
    expect(notificationService.notify).toHaveBeenCalledWith(
      "BOOKING_NO_SHOW",
      expect.anything(),
      expect.objectContaining({ reason: "Customer did not arrive" })
    )
  })

  it("should throw error if transition is invalid", async () => {
    const mockBooking = createMockBooking(BookingStatus.COMPLETED)
    bookingRepository.findById.mockResolvedValue(mockBooking)

    await expect(
      useCase.execute("owner_user", {
        bookingId: "booking_1",
        targetStatus: BookingStatus.CONFIRMED,
      })
    ).rejects.toThrow(/Cannot transition booking status/)
  })
})
