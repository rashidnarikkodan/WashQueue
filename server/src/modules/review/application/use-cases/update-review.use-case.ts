import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { IReviewRepository } from "../../domain/repositories/review.repository.interface"
import { ReviewResponseDTO, UpdateReviewDTO } from "../dtos/review.dto"
import { IUpdateReviewUseCase } from "../interfaces/review-usecases.interface"
import { ReviewDTOMapper } from "../mappers/review-dto.mapper"

export class UpdateReviewUseCase implements IUpdateReviewUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly stationRepository?: IStationRepository
  ) {}

  async execute(
    userId: string,
    reviewId: string,
    input: UpdateReviewDTO
  ): Promise<ReviewResponseDTO> {
    const review = await this.reviewRepository.findById(reviewId)
    if (!review) {
      throw new NotFoundError("Review not found")
    }

    if (review.userId.toString() !== userId.toString()) {
      throw new ForbiddenError("You can only edit your own reviews")
    }

    review.updateReview(input.rating, input.comment)

    const updated = await this.reviewRepository.update(review)

    // Update station aggregate rating
    if (this.stationRepository && review.stationId) {
      try {
        const summary = await this.reviewRepository.getStationRatingSummary(review.stationId)
        const station = await this.stationRepository.findById(review.stationId)
        if (station) {
          station.updateRating(summary.averageRating, summary.reviewCount)
          await this.stationRepository.save(station)
        }
      } catch {
        // Non-blocking station rating update
      }
    }

    return ReviewDTOMapper.toDTO(updated)
  }
}
