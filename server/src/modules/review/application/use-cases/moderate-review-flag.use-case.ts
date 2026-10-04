import { NotFoundError } from "@/common/errors/not-found-error"
import { IReviewRepository } from "../../domain/repositories/review.repository.interface"
import { ReportReviewDTO, ReviewResponseDTO } from "../dtos/review.dto"
import {
  IDismissReviewReportsUseCase,
  IReportReviewUseCase,
} from "../interfaces/review-usecases.interface"
import { ReviewDTOMapper } from "../mappers/review-dto.mapper"

export class ReportReviewUseCase implements IReportReviewUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(reviewId: string, input: ReportReviewDTO): Promise<ReviewResponseDTO> {
    const review = await this.reviewRepository.findById(reviewId)
    if (!review) {
      throw new NotFoundError("Review not found")
    }

    review.report(input.reason)
    const saved = await this.reviewRepository.save(review)
    return ReviewDTOMapper.toDTO(saved)
  }
}

export class DismissReviewReportsUseCase implements IDismissReviewReportsUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(reviewId: string): Promise<ReviewResponseDTO> {
    const review = await this.reviewRepository.findById(reviewId)
    if (!review) {
      throw new NotFoundError("Review not found")
    }

    review.dismissReports()
    const saved = await this.reviewRepository.save(review)
    return ReviewDTOMapper.toDTO(saved)
  }
}
