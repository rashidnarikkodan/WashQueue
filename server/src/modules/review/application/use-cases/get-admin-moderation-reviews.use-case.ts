import {
  FindAdminReviewsOptions,
  IReviewRepository,
} from "../../domain/repositories/review.repository.interface"
import { AdminReviewModerationResponseDTO } from "../dtos/review.dto"
import { IGetAdminModerationReviewsUseCase } from "../interfaces/review-usecases.interface"
import { ReviewDTOMapper } from "../mappers/review-dto.mapper"

export class GetAdminModerationReviewsUseCase implements IGetAdminModerationReviewsUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(options: FindAdminReviewsOptions): Promise<AdminReviewModerationResponseDTO> {
    const [reviewsResult, metrics] = await Promise.all([
      this.reviewRepository.findAdminModerationReviews(options),
      this.reviewRepository.getAdminMetrics({
        startDate: options.startDate,
        endDate: options.endDate,
      }),
    ])

    const reviews = reviewsResult.items.map((item) =>
      ReviewDTOMapper.toDTO(item.review, {
        user: item.user,
        station: item.station,
      })
    )

    return {
      reviews,
      total: reviewsResult.total,
      page: reviewsResult.page,
      limit: reviewsResult.limit,
      totalPages: reviewsResult.totalPages,
      metrics,
    }
  }
}
