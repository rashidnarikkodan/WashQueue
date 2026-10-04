import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { ROLE } from "@/common/constants/role.constants"
import { IStationRatingSyncService } from "../interfaces/station-rating-sync.interface"
import { IReviewRepository } from "../../domain/repositories/review.repository.interface"
import { IDeleteReviewUseCase } from "../interfaces/review-usecases.interface"

export class DeleteReviewUseCase implements IDeleteReviewUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly stationRatingSyncService?: IStationRatingSyncService
  ) {}

  async execute(
    userId: string,
    userRole: string,
    reviewId: string
  ): Promise<{ success: boolean; message: string }> {
    const review = await this.reviewRepository.findById(reviewId)
    if (!review) {
      throw new NotFoundError("Review not found")
    }

    const isOwner = review.userId.toString() === userId.toString()
    const isAdmin = userRole === ROLE.ADMIN

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError("You do not have permission to delete this review")
    }

    await this.reviewRepository.delete(reviewId)

    // Sync station rating and review count via domain service
    if (this.stationRatingSyncService && review.stationId) {
      await this.stationRatingSyncService.syncStationRating(review.stationId)
    }

    return {
      success: true,
      message: "Review deleted successfully",
    }
  }
}
