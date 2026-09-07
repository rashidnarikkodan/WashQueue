import { bookingRepository } from "@/modules/booking/booking.module"
import { stationRepository } from "@/modules/station/station.module"
import { notificationDispatcherService } from "@/modules/notification/notification.module"
import { ReviewMongoRepository } from "./infrastructure/repositories/review.mongo.repository"
import { StationRatingSyncService } from "./application/services/station-rating-sync.service"
import { CreateReviewUseCase } from "./application/use-cases/create-review.use-case"
import { UpdateReviewUseCase } from "./application/use-cases/update-review.use-case"
import { GetReviewByIdUseCase } from "./application/use-cases/get-review-by-id.use-case"
import { GetReviewByBookingUseCase } from "./application/use-cases/get-review-by-booking.use-case"
import { GetStationReviewsUseCase } from "./application/use-cases/get-station-reviews.use-case"
import { GetUserReviewsUseCase } from "./application/use-cases/get-user-reviews.use-case"
import { DeleteReviewUseCase } from "./application/use-cases/delete-review.use-case"
import { ReviewController } from "./presentation/review.controller"
import { createReviewRouter } from "./presentation/review.routes"

// Repository (Data Access)
export const reviewRepository = new ReviewMongoRepository()

// Domain / Application Services
export const stationRatingSyncService = new StationRatingSyncService(
  reviewRepository,
  stationRepository
)

// Use Cases (Application Layer)
export const createReviewUseCase = new CreateReviewUseCase(
  reviewRepository,
  bookingRepository,
  stationRatingSyncService,
  notificationDispatcherService
)

export const updateReviewUseCase = new UpdateReviewUseCase(
  reviewRepository,
  stationRatingSyncService
)

export const getReviewByIdUseCase = new GetReviewByIdUseCase(reviewRepository)
export const getReviewByBookingUseCase = new GetReviewByBookingUseCase(reviewRepository)
export const getStationReviewsUseCase = new GetStationReviewsUseCase(reviewRepository)
export const getUserReviewsUseCase = new GetUserReviewsUseCase(reviewRepository)
export const deleteReviewUseCase = new DeleteReviewUseCase(
  reviewRepository,
  stationRatingSyncService
)

// Controller (Presentation Layer)
export const reviewController = new ReviewController(
  createReviewUseCase,
  updateReviewUseCase,
  getReviewByIdUseCase,
  getReviewByBookingUseCase,
  getStationReviewsUseCase,
  getUserReviewsUseCase,
  deleteReviewUseCase
)

// Router
export const reviewRouter = createReviewRouter(reviewController)

export * from "./domain/entities/Review"
export * from "./domain/repositories/review.repository.interface"
export * from "./application/dtos/review.dto"
export * from "./application/interfaces/review-usecases.interface"

export default reviewRouter
