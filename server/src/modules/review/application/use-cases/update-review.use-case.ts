import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { BadRequestError } from "@/common/errors/bad-request-error"
import { MAX_REVIEW_EDITS } from "../../domain/entities/Review"
import { IStationRatingSyncService } from "../interfaces/station-rating-sync.interface"
import { IReviewRepository } from "../../domain/repositories/review.repository.interface"
import { ReviewResponseDTO, UpdateReviewDTO } from "../dtos/review.dto"
import { IUpdateReviewUseCase } from "../interfaces/review-usecases.interface"
import { ReviewDTOMapper } from "../mappers/review-dto.mapper"

export class UpdateReviewUseCase implements IUpdateReviewUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly stationRatingSyncService?: IStationRatingSyncService
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

    if ((review.updateCount || 0) >= MAX_REVIEW_EDITS) {
      throw new BadRequestError(
        `You have reached the maximum limit of ${MAX_REVIEW_EDITS} edits for this review`
      )
    }

    review.updateReview(input.rating, input.comment)

    const updated = await this.reviewRepository.save(review)

    // Sync station aggregate rating via domain service
    if (this.stationRatingSyncService && review.stationId) {
      await this.stationRatingSyncService.syncStationRating(review.stationId)
    }

    return ReviewDTOMapper.toDTO(updated)
  }
}
