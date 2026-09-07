import {
  AdminReviewModerationResponseDTO,
  CreateReviewDTO,
  ProviderFeedbackResponseDTO,
  ReportReviewDTO,
  ReviewResponseDTO,
  StationReviewsResponseDTO,
  ToggleReviewVisibilityDTO,
  UpdateReviewDTO,
  UserReviewsResponseDTO,
} from "../dtos/review.dto"
import { FindAdminReviewsOptions } from "../../domain/repositories/review.repository.interface"
import { GetProviderFeedbackInput } from "../use-cases/get-provider-feedback.use-case"

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

export interface IGetAdminModerationReviewsUseCase {
  execute(options: FindAdminReviewsOptions): Promise<AdminReviewModerationResponseDTO>
}

export interface IToggleReviewVisibilityUseCase {
  execute(reviewId: string, input: ToggleReviewVisibilityDTO): Promise<ReviewResponseDTO>
}

export interface IReportReviewUseCase {
  execute(reviewId: string, input: ReportReviewDTO): Promise<ReviewResponseDTO>
}

export interface IDismissReviewReportsUseCase {
  execute(reviewId: string): Promise<ReviewResponseDTO>
}

export interface IGetProviderFeedbackUseCase {
  execute(input: GetProviderFeedbackInput): Promise<ProviderFeedbackResponseDTO>
}
