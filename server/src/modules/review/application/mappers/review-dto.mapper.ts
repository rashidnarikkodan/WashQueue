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
    },
    isAdmin: boolean = false
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
      reportCount: isAdmin ? (data.reportCount ?? 0) : undefined,
      flags: isAdmin && data.flags ? [...data.flags] : undefined,
      createdAt: data.createdAt?.toISOString(),
      updatedAt: data.updatedAt?.toISOString(),
      user: extra?.user
        ? {
            name: extra.user.name,
            avatar: extra.user.avatar,
            email: isAdmin ? extra.user.email : undefined,
          }
        : undefined,
      station: extra?.station,
      booking: extra?.booking,
    }
  }
}
