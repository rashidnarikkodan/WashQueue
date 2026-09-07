import { NotFoundError } from "@/common/errors/not-found-error"
import { IReviewRepository } from "../../domain/repositories/review.repository.interface"
import { IStationRatingSyncService } from "../interfaces/station-rating-sync.interface"
import { ReviewResponseDTO, ToggleReviewVisibilityDTO } from "../dtos/review.dto"
import { IToggleReviewVisibilityUseCase } from "../interfaces/review-usecases.interface"
import { ReviewDTOMapper } from "../mappers/review-dto.mapper"

export class ToggleReviewVisibilityUseCase implements IToggleReviewVisibilityUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly stationRatingSyncService?: IStationRatingSyncService
  ) {}

  async execute(reviewId: string, input: ToggleReviewVisibilityDTO): Promise<ReviewResponseDTO> {
    const review = await this.reviewRepository.findById(reviewId)
    if (!review) {
      throw new NotFoundError("Review not found")
    }

    review.setVisible(input.isVisible)
    const saved = await this.reviewRepository.save(review)

    // Sync station aggregated rating since visibility impacts aggregate stats
    if (this.stationRatingSyncService && review.stationId) {
      await this.stationRatingSyncService.syncStationRating(review.stationId)
    }

    return ReviewDTOMapper.toDTO(saved)
  }
}
