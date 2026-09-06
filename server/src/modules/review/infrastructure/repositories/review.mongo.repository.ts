import { Types } from "mongoose"
import { Review } from "../../domain/entities/Review"
import {
  FindReviewsOptions,
  IReviewRepository,
  StationRatingSummary,
  StationReviewsResult,
  UserReviewsResult,
} from "../../domain/repositories/review.repository.interface"
import { ReviewMapper } from "../mappers/review.mapper"
import { ReviewModel } from "../models/review.model"

export class ReviewMongoRepository implements IReviewRepository {
  async create(review: Review): Promise<Review> {
    const raw = ReviewMapper.toPersistence(review)
    const created = await ReviewModel.create(raw)
    return ReviewMapper.toDomain(created)
  }

  async update(review: Review): Promise<Review> {
    const data = review.data
    if (!data.id) {
      throw new Error("Cannot update review without an id")
    }

    const updated = await ReviewModel.findByIdAndUpdate(
      data.id,
      {
        $set: {
          rating: data.rating,
          comment: data.comment,
          update_count: data.updateCount,
        },
      },
      { new: true }
    )

    if (!updated) {
      throw new Error("Review not found for update")
    }

    return ReviewMapper.toDomain(updated)
  }

  async findById(id: string): Promise<Review | null> {
    if (!Types.ObjectId.isValid(id)) return null
    const found = await ReviewModel.findById(id)
    return found ? ReviewMapper.toDomain(found) : null
  }

  async findByBookingId(bookingId: string): Promise<Review | null> {
    if (!Types.ObjectId.isValid(bookingId)) return null
    const found = await ReviewModel.findOne({
      bookingId: new Types.ObjectId(bookingId),
    })
    return found ? ReviewMapper.toDomain(found) : null
  }

  async findByStationId(
    stationId: string,
    options: FindReviewsOptions = {}
  ): Promise<StationReviewsResult> {
    const page = Math.max(1, options.page || 1)
    const limit = Math.max(1, Math.min(100, options.limit || 10))
    const skip = (page - 1) * limit

    if (!Types.ObjectId.isValid(stationId)) {
      return {
        reviews: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        averageRating: 0,
        reviewCount: 0,
      }
    }

    const stationObjectId = new Types.ObjectId(stationId)

    const [docs, total, summary] = await Promise.all([
      ReviewModel.find({ stationId: stationObjectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name avatar email"),
      ReviewModel.countDocuments({ stationId: stationObjectId }),
      this.getStationRatingSummary(stationId),
    ])

    const reviews = docs.map((doc) => ReviewMapper.toDomain(doc))

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
      averageRating: summary.averageRating,
      reviewCount: summary.reviewCount,
    }
  }

  async findByUserId(userId: string, options: FindReviewsOptions = {}): Promise<UserReviewsResult> {
    const page = Math.max(1, options.page || 1)
    const limit = Math.max(1, Math.min(100, options.limit || 10))
    const skip = (page - 1) * limit

    if (!Types.ObjectId.isValid(userId)) {
      return {
        reviews: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      }
    }

    const userObjectId = new Types.ObjectId(userId)

    const [docs, total] = await Promise.all([
      ReviewModel.find({ userId: userObjectId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ReviewModel.countDocuments({ userId: userObjectId }),
    ])

    const reviews = docs.map((doc) => ReviewMapper.toDomain(doc))

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    }
  }

  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return
    await ReviewModel.findByIdAndDelete(id)
  }

  async getStationRatingSummary(stationId: string): Promise<StationRatingSummary> {
    if (!Types.ObjectId.isValid(stationId)) {
      return { averageRating: 0, reviewCount: 0 }
    }

    const result = await ReviewModel.aggregate<{ _id: null; averageRating: number; count: number }>(
      [
        { $match: { stationId: new Types.ObjectId(stationId) } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            count: { $sum: 1 },
          },
        },
      ]
    )

    const first = result[0]
    if (!first) {
      return { averageRating: 0, reviewCount: 0 }
    }

    return {
      averageRating: Math.round(first.averageRating * 10) / 10,
      reviewCount: first.count,
    }
  }
}
