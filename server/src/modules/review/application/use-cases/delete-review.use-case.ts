import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { ROLE } from "@/common/constants/role.constants"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { IReviewRepository } from "../../domain/repositories/review.repository.interface"
import { IDeleteReviewUseCase } from "../interfaces/review-usecases.interface"

export class DeleteReviewUseCase implements IDeleteReviewUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly stationRepository?: IStationRepository
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

    // Update station rating and review count
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

    return {
      success: true,
      message: "Review deleted successfully",
    }
  }
}
