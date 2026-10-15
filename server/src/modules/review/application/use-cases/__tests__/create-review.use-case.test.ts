import { describe, it, expect, vi, beforeEach } from "vitest"
import { CreateReviewUseCase } from "../create-review.use-case"
import { IReviewRepository } from "../../../domain/repositories/review.repository.interface"
import { IBookingRepository } from "@/modules/booking/domain/repositories/booking.repository"
import { IStationRatingSyncService } from "../../interfaces/station-rating-sync.interface"
import { INotificationDispatcherService } from "@/modules/notification/notification.module"
import {
  Booking,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
  ServiceType,
} from "@/modules/booking/domain/entities/Booking"
import { Review } from "../../../domain/entities/Review"

describe("CreateReviewUseCase", () => {
  let mockReviewRepo: Partial<IReviewRepository>
  let mockBookingRepo: Partial<IBookingRepository>
  let mockStationRatingSyncService: Partial<IStationRatingSyncService>
  let mockNotificationDispatcher: Partial<INotificationDispatcherService>
  let useCase: CreateReviewUseCase

  const sampleBooking = new Booking({
    id: "booking-999",
    bookingNumber: "WQ-999",
    userId: "user-1",
    ownerId: "owner-doc-id-1",
    stationId: "station-doc-id-1",
    serviceType: ServiceType.FULL,
    vehicleId: "vehicle-1",
    vehicleSnapshot: {
      vehicleCategoryId: "cat-1",
      vehicleClassId: "cls-1",
    },
    extraServices: [],
    isWalkIn: false,
    createdByUserId: "user-1",
    qr: {
      qrTokenHash: "hash-999",
      qrExpiresAt: new Date(Date.now() + 3600000),
    },
    cashAmount: 0,
    refundAmount: 0,
    settlement: {
      platformCommission: 50,
      stationSettlement: 450,
    },
    status: BookingStatus.COMPLETED,
    paymentStatus: PaymentStatus.PAID,
    paymentMethod: PaymentMethod.ONLINE,
    depositAmount: 500,
    pricingSnapshot: {
      basePrice: 500,
      extraPrice: 0,
      totalPrice: 500,
      currency: "INR",
    },
    scheduling: {
      windowStart: new Date(),
      windowEnd: new Date(),
      timeWindowId: "tw-1",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  beforeEach(() => {
    mockReviewRepo = {
      findByBookingId: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockImplementation((r: Review) => Promise.resolve(r)),
    }
    mockBookingRepo = {
      findById: vi.fn().mockResolvedValue(sampleBooking),
    }
    mockStationRatingSyncService = {
      syncStationRating: vi.fn().mockResolvedValue(undefined),
    }
    mockNotificationDispatcher = {
      dispatchToStationStakeholders: vi.fn().mockResolvedValue(undefined),
    }

    useCase = new CreateReviewUseCase(
      mockReviewRepo as IReviewRepository,
      mockBookingRepo as IBookingRepository,
      mockStationRatingSyncService as IStationRatingSyncService,
      mockNotificationDispatcher as INotificationDispatcherService
    )
  })

  it("should create review and dispatch notification to station stakeholders using stationId", async () => {
    const result = await useCase.execute("user-1", {
      bookingId: "booking-999",
      rating: 5,
      comment: "Outstanding wash experience!",
    })

    expect(result).toBeDefined()
    expect(result.rating).toBe(5)
    expect(result.comment).toBe("Outstanding wash experience!")
    expect(mockStationRatingSyncService.syncStationRating).toHaveBeenCalledWith("station-doc-id-1")
    expect(mockNotificationDispatcher.dispatchToStationStakeholders).toHaveBeenCalledWith(
      expect.objectContaining({
        stationId: "station-doc-id-1",
        notifyOwner: true,
        notifyManagers: true,
        defaultPayload: expect.objectContaining({
          type: "SYSTEM",
          title: "New 5★ Review Received",
          message: expect.stringContaining("Outstanding wash experience!"),
        }),
      })
    )
  })
})
