import { Types } from "mongoose"
import { BaseRepository } from "@/infrastructure/database/repository/base.repository"
import { Review } from "../../domain/entities/Review"
import {
  FindReviewsOptions,
  IReviewRepository,
  StationRatingSummary,
  StationReviewsResult,
  UserReviewsResult,
} from "../../domain/repositories/review.repository.interface"
import { ReviewMapper } from "../mappers/review.mapper"
import { IReview, ReviewModel } from "../models/review.model"

export class ReviewMongoRepository
  extends BaseRepository<Review, IReview>
  implements IReviewRepository
{
  constructor() {
    super(ReviewModel, new ReviewMapper())
  }

  async create(review: Review): Promise<Review> {
    return this.save(review)
  }

  async findByBookingId(bookingId: string): Promise<Review | null> {
    if (!Types.ObjectId.isValid(bookingId)) return null
    const found = await this.model
      .findOne({
        bookingId: new Types.ObjectId(bookingId),
      })
      .exec()
    return found ? this.mapper.toDomain(found) : null
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

    let sortCriteria: Record<string, 1 | -1> = { createdAt: -1 }
    const sortUpper = options.sortBy?.toUpperCase()
    if (sortUpper === "HIGHEST") {
      sortCriteria = { rating: -1, createdAt: -1 }
    } else if (sortUpper === "LOWEST") {
      sortCriteria = { rating: 1, createdAt: -1 }
    }

    const [docs, total, summary] = await Promise.all([
      this.model
        .find({ stationId: stationObjectId })
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .populate("userId", "name avatar email"),
      this.model.countDocuments({ stationId: stationObjectId }),
      this.getStationRatingSummary(stationId),
    ])

    const reviews = docs.map((doc) => this.mapper.toDomain(doc))

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
      this.model.find({ userId: userObjectId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.model.countDocuments({ userId: userObjectId }),
    ])

    const reviews = docs.map((doc) => this.mapper.toDomain(doc))

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    }
  }

  async getStationRatingSummary(stationId: string): Promise<StationRatingSummary> {
    if (!Types.ObjectId.isValid(stationId)) {
      return { averageRating: 0, reviewCount: 0 }
    }

    const result = await this.model.aggregate<{ _id: null; averageRating: number; count: number }>([
      { $match: { stationId: new Types.ObjectId(stationId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ])

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
