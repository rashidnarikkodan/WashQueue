import { IReviewRepository } from "../../domain/repositories/review.repository.interface"
import { ReviewResponseDTO } from "../dtos/review.dto"
import { IGetReviewByBookingUseCase } from "../interfaces/review-usecases.interface"
import { ReviewDTOMapper } from "../mappers/review-dto.mapper"

export class GetReviewByBookingUseCase implements IGetReviewByBookingUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(bookingId: string): Promise<ReviewResponseDTO | null> {
    const review = await this.reviewRepository.findByBookingId(bookingId)
    return review ? ReviewDTOMapper.toDTO(review) : null
  }
}
