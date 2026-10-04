import { IReviewRepository } from "../../domain/repositories/review.repository.interface"
import { UserReviewsResponseDTO } from "../dtos/review.dto"
import { IGetUserReviewsUseCase } from "../interfaces/review-usecases.interface"
import { ReviewDTOMapper } from "../mappers/review-dto.mapper"

export class GetUserReviewsUseCase implements IGetUserReviewsUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(
    userId: string,
    options?: { page?: number; limit?: number }
  ): Promise<UserReviewsResponseDTO> {
    const result = await this.reviewRepository.findByUserId(userId, options)
    return {
      reviews: result.reviews.map((r) => ReviewDTOMapper.toDTO(r)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    }
  }
}
