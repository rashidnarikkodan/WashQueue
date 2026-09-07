import { describe, it, expect, vi, beforeEach } from "vitest"
import { Review } from "../domain/entities/Review"
import { IReviewRepository } from "../domain/repositories/review.repository.interface"
import { CreateReviewUseCase } from "../application/use-cases/create-review.use-case"
import { UpdateReviewUseCase } from "../application/use-cases/update-review.use-case"
import { GetReviewByIdUseCase } from "../application/use-cases/get-review-by-id.use-case"
import { GetReviewByBookingUseCase } from "../application/use-cases/get-review-by-booking.use-case"
import { GetStationReviewsUseCase } from "../application/use-cases/get-station-reviews.use-case"
import { GetUserReviewsUseCase } from "../application/use-cases/get-user-reviews.use-case"
import { DeleteReviewUseCase } from "../application/use-cases/delete-review.use-case"
import { StationRatingSyncService } from "../application/services/station-rating-sync.service"
import { IBookingRepository } from "@/modules/booking/domain/repositories/booking.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { Booking, BookingStatus } from "@/modules/booking/domain/entities/Booking"
import { Station } from "@/modules/station/domain/entities/Station"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { BadRequestError } from "@/common/errors/bad-request-error"
import { ConflictError } from "@/common/errors/conflict-error"
import { ROLE } from "@/common/constants/role.constants"

describe("Review Module Unit Tests", () => {
  let mockReviewRepo: IReviewRepository
  let mockBookingRepo: IBookingRepository
  let mockStationRepo: IStationRepository

  beforeEach(() => {
    mockReviewRepo = {
      save: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findById: vi.fn(),
      findByBookingId: vi.fn(),
      findByStationId: vi.fn(),
      findByUserId: vi.fn(),
      delete: vi.fn(),
      getStationRatingSummary: vi.fn().mockResolvedValue({ averageRating: 4.5, reviewCount: 1 }),
    }

    mockBookingRepo = {
      findById: vi.fn(),
      save: vi.fn(),
      findAll: vi.fn(),
      findByUserId: vi.fn(),
      findByStationId: vi.fn(),
      updateStatusWithGuard: vi.fn(),
      countByStationAndStatus: vi.fn(),
      findUpcomingByUserId: vi.fn(),
      findHistoryByUserId: vi.fn(),
      findActiveQueue: vi.fn(),
      getBookingStats: vi.fn(),
      findByReferenceId: vi.fn(),
    } as unknown as IBookingRepository

    mockStationRepo = {
      findById: vi.fn(),
      save: vi.fn(),
      findAll: vi.fn(),
      findByName: vi.fn(),
      findByIds: vi.fn(),
      findNearby: vi.fn(),
      findByOwnerId: vi.fn(),
      findByManagerId: vi.fn(),
      setManagerId: vi.fn(),
      findStationManagedByOwner: vi.fn(),
    } as unknown as IStationRepository
  })

  describe("Review Domain Entity", () => {
    it("should instantiate a valid review", () => {
      const review = new Review({
        userId: "user-1",
        ownerId: "owner-1",
        stationId: "station-1",
        bookingId: "booking-1",
        rating: 5,
        comment: "Excellent service!",
        updateCount: 0,
      })

      expect(review.userId).toBe("user-1")
      expect(review.rating).toBe(5)
      expect(review.comment).toBe("Excellent service!")
      expect(review.updateCount).toBe(0)
    })

    it("should throw error if rating is less than 1 or greater than 5", () => {
      expect(
        () =>
          new Review({
            userId: "user-1",
            ownerId: "owner-1",
            stationId: "station-1",
            bookingId: "booking-1",
            rating: 0,
            comment: "",
            updateCount: 0,
          })
      ).toThrow("Rating must be between 1 and 5")

      expect(
        () =>
          new Review({
            userId: "user-1",
            ownerId: "owner-1",
            stationId: "station-1",
            bookingId: "booking-1",
            rating: 6,
            comment: "",
            updateCount: 0,
          })
      ).toThrow("Rating must be between 1 and 5")
    })

    it("should update review and increment updateCount", () => {
      const review = new Review({
        userId: "user-1",
        ownerId: "owner-1",
        stationId: "station-1",
        bookingId: "booking-1",
        rating: 4,
        comment: "Good",
        updateCount: 0,
      })

      review.updateReview(5, "Even better after polish")
      expect(review.rating).toBe(5)
      expect(review.comment).toBe("Even better after polish")
      expect(review.updateCount).toBe(1)
    })
  })

  describe("CreateReviewUseCase", () => {
    it("should create a review for a completed booking and update station rating", async () => {
      const mockBooking = {
        id: "booking-1",
        userId: "user-1",
        ownerId: "owner-1",
        stationId: "station-1",
        status: BookingStatus.COMPLETED,
      } as unknown as Booking

      const mockStation = new Station({
        id: "station-1",
        ownerId: "owner-1",
        name: "Speedy Wash",
        description: "Test description",
        status: "ACTIVE" as any,
        rating: 0,
        reviewCount: 0,
        contact: { phone: "1234567890", email: "test@wash.com" },
        location: { latitude: 12.9716, longitude: 77.5946 },
        address: {
          street: "1st St",
          city: "City",
          state: "State",
          pincode: "123456",
          country: "Country",
        },
        operatingHours: [],
        holidays: [],
        slotConfig: {
          bays: 2,
          windowDurationMins: 30,
          capacityPerWindow: 2,
          walkInReservedSlots: 0,
          maxAdvanceBookingDays: 7,
          allowWalkIns: true,
        },
        amenities: [],
        images: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      vi.mocked(mockBookingRepo.findById).mockResolvedValue(mockBooking)
      vi.mocked(mockReviewRepo.findByBookingId).mockResolvedValue(null)
      vi.mocked(mockReviewRepo.save).mockImplementation(async (r) => {
        return new Review({
          ...r.data,
          id: "review-1",
        })
      })
      vi.mocked(mockStationRepo.findById).mockResolvedValue(mockStation)

      const syncService = new StationRatingSyncService(mockReviewRepo, mockStationRepo)
      const useCase = new CreateReviewUseCase(mockReviewRepo, mockBookingRepo, syncService)
      const result = await useCase.execute("user-1", {
        bookingId: "booking-1",
        rating: 5,
        comment: "Spotless car!",
      })

      expect(result.id).toBe("review-1")
      expect(result.rating).toBe(5)
      expect(result.comment).toBe("Spotless car!")
      expect(mockReviewRepo.save).toHaveBeenCalled()
      expect(mockStationRepo.save).toHaveBeenCalled()
    })

    it("should throw NotFoundError if booking does not exist", async () => {
      vi.mocked(mockBookingRepo.findById).mockResolvedValue(null)
      const useCase = new CreateReviewUseCase(mockReviewRepo, mockBookingRepo)

      await expect(
        useCase.execute("user-1", { bookingId: "nonexistent", rating: 5 })
      ).rejects.toThrow(NotFoundError)
    })

    it("should throw ForbiddenError if user does not own the booking", async () => {
      const mockBooking = {
        id: "booking-1",
        userId: "user-2",
        status: BookingStatus.COMPLETED,
      } as unknown as Booking

      vi.mocked(mockBookingRepo.findById).mockResolvedValue(mockBooking)
      const useCase = new CreateReviewUseCase(mockReviewRepo, mockBookingRepo)

      await expect(
        useCase.execute("user-1", { bookingId: "booking-1", rating: 5 })
      ).rejects.toThrow(ForbiddenError)
    })

    it("should throw BadRequestError if booking is not COMPLETED", async () => {
      const mockBooking = {
        id: "booking-1",
        userId: "user-1",
        status: BookingStatus.CONFIRMED,
      } as unknown as Booking

      vi.mocked(mockBookingRepo.findById).mockResolvedValue(mockBooking)
      const useCase = new CreateReviewUseCase(mockReviewRepo, mockBookingRepo)

      await expect(
        useCase.execute("user-1", { bookingId: "booking-1", rating: 5 })
      ).rejects.toThrow(BadRequestError)
    })

    it("should throw ConflictError if booking already has a review", async () => {
      const mockBooking = {
        id: "booking-1",
        userId: "user-1",
        status: BookingStatus.COMPLETED,
      } as unknown as Booking

      const existingReview = new Review({
        id: "review-1",
        userId: "user-1",
        ownerId: "owner-1",
        stationId: "station-1",
        bookingId: "booking-1",
        rating: 4,
        comment: "",
        updateCount: 0,
      })

      vi.mocked(mockBookingRepo.findById).mockResolvedValue(mockBooking)
      vi.mocked(mockReviewRepo.findByBookingId).mockResolvedValue(existingReview)
      const useCase = new CreateReviewUseCase(mockReviewRepo, mockBookingRepo)

      await expect(
        useCase.execute("user-1", { bookingId: "booking-1", rating: 5 })
      ).rejects.toThrow(ConflictError)
    })
  })

  describe("UpdateReviewUseCase", () => {
    it("should update review and return updated DTO", async () => {
      const existingReview = new Review({
        id: "review-1",
        userId: "user-1",
        ownerId: "owner-1",
        stationId: "station-1",
        bookingId: "booking-1",
        rating: 3,
        comment: "Average",
        updateCount: 0,
      })

      vi.mocked(mockReviewRepo.findById).mockResolvedValue(existingReview)
      vi.mocked(mockReviewRepo.save).mockImplementation(async (r) => r)

      const useCase = new UpdateReviewUseCase(mockReviewRepo)
      const result = await useCase.execute("user-1", "review-1", {
        rating: 4,
        comment: "Actually better than expected",
      })

      expect(result.rating).toBe(4)
      expect(result.comment).toBe("Actually better than expected")
      expect(result.updateCount).toBe(1)
    })

    it("should throw ForbiddenError if attempting to update someone else's review", async () => {
      const existingReview = new Review({
        id: "review-1",
        userId: "user-2",
        ownerId: "owner-1",
        stationId: "station-1",
        bookingId: "booking-1",
        rating: 3,
        comment: "Average",
        updateCount: 0,
      })

      vi.mocked(mockReviewRepo.findById).mockResolvedValue(existingReview)
      const useCase = new UpdateReviewUseCase(mockReviewRepo)

      await expect(useCase.execute("user-1", "review-1", { rating: 5 })).rejects.toThrow(
        ForbiddenError
      )
    })
  })

  describe("GetReviewByIdUseCase & GetReviewByBookingUseCase", () => {
    it("should retrieve review by id", async () => {
      const review = new Review({
        id: "review-1",
        userId: "user-1",
        ownerId: "owner-1",
        stationId: "station-1",
        bookingId: "booking-1",
        rating: 5,
        comment: "Great",
        updateCount: 0,
      })

      vi.mocked(mockReviewRepo.findById).mockResolvedValue(review)
      const useCase = new GetReviewByIdUseCase(mockReviewRepo)
      const result = await useCase.execute("review-1")

      expect(result.id).toBe("review-1")
      expect(result.rating).toBe(5)
    })

    it("should retrieve review by booking id", async () => {
      const review = new Review({
        id: "review-1",
        userId: "user-1",
        ownerId: "owner-1",
        stationId: "station-1",
        bookingId: "booking-1",
        rating: 5,
        comment: "Great",
        updateCount: 0,
      })

      vi.mocked(mockReviewRepo.findByBookingId).mockResolvedValue(review)
      const useCase = new GetReviewByBookingUseCase(mockReviewRepo)
      const result = await useCase.execute("booking-1")

      expect(result?.bookingId).toBe("booking-1")
    })
  })

  describe("GetStationReviewsUseCase & GetUserReviewsUseCase", () => {
    it("should return station reviews result", async () => {
      const review = new Review({
        id: "review-1",
        userId: "user-1",
        ownerId: "owner-1",
        stationId: "station-1",
        bookingId: "booking-1",
        rating: 5,
        comment: "Great",
        updateCount: 0,
      })

      vi.mocked(mockReviewRepo.findByStationId).mockResolvedValue({
        reviews: [review],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        averageRating: 5,
        reviewCount: 1,
      })

      const useCase = new GetStationReviewsUseCase(mockReviewRepo)
      const result = await useCase.execute("station-1")

      expect(result.total).toBe(1)
      expect(result.averageRating).toBe(5)
      expect(result.reviews[0]?.id).toBe("review-1")
    })

    it("should return user reviews result", async () => {
      const review = new Review({
        id: "review-1",
        userId: "user-1",
        ownerId: "owner-1",
        stationId: "station-1",
        bookingId: "booking-1",
        rating: 5,
        comment: "Great",
        updateCount: 0,
      })

      vi.mocked(mockReviewRepo.findByUserId).mockResolvedValue({
        reviews: [review],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      })

      const useCase = new GetUserReviewsUseCase(mockReviewRepo)
      const result = await useCase.execute("user-1")

      expect(result.total).toBe(1)
      expect(result.reviews[0]?.userId).toBe("user-1")
    })
  })

  describe("DeleteReviewUseCase", () => {
    it("should allow owner to delete review", async () => {
      const review = new Review({
        id: "review-1",
        userId: "user-1",
        ownerId: "owner-1",
        stationId: "station-1",
        bookingId: "booking-1",
        rating: 5,
        comment: "Great",
        updateCount: 0,
      })

      vi.mocked(mockReviewRepo.findById).mockResolvedValue(review)
      const useCase = new DeleteReviewUseCase(mockReviewRepo)
      const result = await useCase.execute("user-1", ROLE.CUSTOMER, "review-1")

      expect(result.success).toBe(true)
      expect(mockReviewRepo.delete).toHaveBeenCalledWith("review-1")
    })

    it("should allow ADMIN to delete any review", async () => {
      const review = new Review({
        id: "review-1",
        userId: "user-1",
        ownerId: "owner-1",
        stationId: "station-1",
        bookingId: "booking-1",
        rating: 5,
        comment: "Great",
        updateCount: 0,
      })

      vi.mocked(mockReviewRepo.findById).mockResolvedValue(review)
      const useCase = new DeleteReviewUseCase(mockReviewRepo)
      const result = await useCase.execute("admin-1", ROLE.ADMIN, "review-1")

      expect(result.success).toBe(true)
      expect(mockReviewRepo.delete).toHaveBeenCalledWith("review-1")
    })

    it("should forbid non-author non-admin user from deleting", async () => {
      const review = new Review({
        id: "review-1",
        userId: "user-1",
        ownerId: "owner-1",
        stationId: "station-1",
        bookingId: "booking-1",
        rating: 5,
        comment: "Great",
        updateCount: 0,
      })

      vi.mocked(mockReviewRepo.findById).mockResolvedValue(review)
      const useCase = new DeleteReviewUseCase(mockReviewRepo)

      await expect(useCase.execute("other-user", ROLE.CUSTOMER, "review-1")).rejects.toThrow(
        ForbiddenError
      )
    })
  })
})
