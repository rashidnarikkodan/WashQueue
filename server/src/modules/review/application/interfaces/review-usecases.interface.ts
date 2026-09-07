import {
  CreateReviewDTO,
  ReviewResponseDTO,
  StationReviewsResponseDTO,
  UpdateReviewDTO,
  UserReviewsResponseDTO,
} from "../dtos/review.dto"

export interface ICreateReviewUseCase {
  execute(userId: string, input: CreateReviewDTO): Promise<ReviewResponseDTO>
}

export interface IUpdateReviewUseCase {
  execute(userId: string, reviewId: string, input: UpdateReviewDTO): Promise<ReviewResponseDTO>
}

export interface IGetReviewByIdUseCase {
  execute(reviewId: string): Promise<ReviewResponseDTO>
}

export interface IGetReviewByBookingUseCase {
  execute(bookingId: string): Promise<ReviewResponseDTO | null>
}

export interface IGetStationReviewsUseCase {
  execute(
    stationId: string,
    options?: { page?: number; limit?: number; sortBy?: string }
  ): Promise<StationReviewsResponseDTO>
}

export interface IGetUserReviewsUseCase {
  execute(
    userId: string,
    options?: { page?: number; limit?: number }
  ): Promise<UserReviewsResponseDTO>
}

export interface IDeleteReviewUseCase {
  execute(
    userId: string,
    userRole: string,
    reviewId: string
  ): Promise<{ success: boolean; message: string }>
}
