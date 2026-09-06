import { Review } from "../../domain/entities/Review"
import { ReviewResponseDTO } from "../dtos/review.dto"

export class ReviewDTOMapper {
  static toDTO(review: Review): ReviewResponseDTO {
    const data = review.data
    return {
      id: data.id || "",
      userId: data.userId,
      ownerId: data.ownerId,
      stationId: data.stationId,
      bookingId: data.bookingId,
      rating: data.rating,
      comment: data.comment,
      updateCount: data.updateCount,
      createdAt: data.createdAt?.toISOString(),
      updatedAt: data.updatedAt?.toISOString(),
    }
  }
}
