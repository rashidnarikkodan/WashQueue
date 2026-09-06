import { Review } from "../../domain/entities/Review"
import { IReview } from "../models/review.model"
import { Types } from "mongoose"

export class ReviewMapper {
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

  static toPersistence(review: Review): Partial<IReview> {
    const data = review.data
    const persistence: Partial<IReview> = {
      userId: new Types.ObjectId(data.userId),
      ownerId: new Types.ObjectId(data.ownerId),
      stationId: new Types.ObjectId(data.stationId),
      bookingId: new Types.ObjectId(data.bookingId),
      rating: data.rating,
      comment: data.comment,
      update_count: data.updateCount,
    }

    if (data.id) {
      persistence._id = new Types.ObjectId(data.id)
    }

    return persistence
  }
}
