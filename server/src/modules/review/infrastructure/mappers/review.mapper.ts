import { Review } from "../../domain/entities/Review"
import { IReview } from "../models/review.model"
import { IMapper } from "@/core/domain/repository.interface"
import { Types } from "mongoose"

export class ReviewMapper implements IMapper<Review, IReview> {
  toDomain(raw: IReview): Review {
    return ReviewMapper.toDomain(raw)
  }

  toPersistence(entity: Partial<Review>): Partial<IReview> {
    return ReviewMapper.toPersistence(entity)
  }

  static toDomain(raw: IReview): Review {
    return new Review({
      id: raw._id.toString(),
      userId: raw.userId ? raw.userId.toString() : "",
      ownerId: raw.ownerId ? raw.ownerId.toString() : "",
      stationId: raw.stationId ? raw.stationId.toString() : "",
      bookingId: raw.bookingId ? raw.bookingId.toString() : "",
      rating: raw.rating,
      comment: raw.comment ?? "",
      updateCount: raw.update_count ?? 0,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    })
  }

  static toPersistence(review: Partial<Review>): Partial<IReview> {
    const data = review instanceof Review ? review.data : review
    const persistence: Partial<IReview> = {}

    if (data?.userId) persistence.userId = new Types.ObjectId(data.userId)
    if (data?.ownerId) persistence.ownerId = new Types.ObjectId(data.ownerId)
    if (data?.stationId) persistence.stationId = new Types.ObjectId(data.stationId)
    if (data?.bookingId) persistence.bookingId = new Types.ObjectId(data.bookingId)
    if (data?.rating !== undefined) persistence.rating = data.rating
    if (data?.comment !== undefined) persistence.comment = data.comment
    if (data?.updateCount !== undefined) persistence.update_count = data.updateCount
    if (data?.id) persistence._id = new Types.ObjectId(data.id)

    return persistence
  }
}
