import { Review } from "../../domain/entities/Review"
import { ReviewResponseDTO } from "../dtos/review.dto"

export class ReviewDTOMapper {
  static toDTO(
    review: Review,
    extra?: {
      user?: { name?: string; avatar?: string; email?: string }
      station?: {
        id?: string
        name?: string
        address?: string
        city?: string
        state?: string
        image?: string
      }
      booking?: {
        id?: string
        bookingNumber?: string
        serviceType?: string
        dateTime?: string
      }
    }
  ): ReviewResponseDTO {
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
      isVisible: data.isVisible ?? true,
      reportCount: data.reportCount ?? 0,
      flags: data.flags ? [...data.flags] : [],
      createdAt: data.createdAt?.toISOString(),
      updatedAt: data.updatedAt?.toISOString(),
      user: extra?.user,
      station: extra?.station,
      booking: extra?.booking,
    }
  }
}
