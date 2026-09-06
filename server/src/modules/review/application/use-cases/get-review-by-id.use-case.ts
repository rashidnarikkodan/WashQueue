import { NotFoundError } from "@/common/errors/not-found-error"
import { IReviewRepository } from "../../domain/repositories/review.repository.interface"
import { ReviewResponseDTO } from "../dtos/review.dto"
import { IGetReviewByIdUseCase } from "../interfaces/review-usecases.interface"
import { ReviewDTOMapper } from "../mappers/review-dto.mapper"

export class GetReviewByIdUseCase implements IGetReviewByIdUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(reviewId: string): Promise<ReviewResponseDTO> {
    const review = await this.reviewRepository.findById(reviewId)
    if (!review) {
      throw new NotFoundError("Review not found")
    }
    return ReviewDTOMapper.toDTO(review)
  }
}
