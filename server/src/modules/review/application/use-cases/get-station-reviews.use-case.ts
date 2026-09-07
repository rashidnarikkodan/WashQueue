import { IReviewRepository } from "../../domain/repositories/review.repository.interface"
import { StationReviewsResponseDTO } from "../dtos/review.dto"
import { IGetStationReviewsUseCase } from "../interfaces/review-usecases.interface"
import { ReviewDTOMapper } from "../mappers/review-dto.mapper"

export class GetStationReviewsUseCase implements IGetStationReviewsUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(
    stationId: string,
    options?: { page?: number; limit?: number; sortBy?: string }
  ): Promise<StationReviewsResponseDTO> {
    const result = await this.reviewRepository.findByStationId(stationId, options)
    return {
      reviews: result.reviews.map((r) => ReviewDTOMapper.toDTO(r)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      averageRating: result.averageRating,
      reviewCount: result.reviewCount,
    }
  }
}
