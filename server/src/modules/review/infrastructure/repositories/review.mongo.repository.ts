import { Types } from "mongoose"
import { BaseRepository } from "@/infrastructure/database/repository/base.repository"
import { Review } from "../../domain/entities/Review"
import {
  AdminModerationReviewsResult,
  FindAdminReviewsOptions,
  FindProviderFeedbackOptions,
  FindReviewsOptions,
  IReviewRepository,
  ProviderFeedbackReviewsResult,
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
        .find({ stationId: stationObjectId, isVisible: { $ne: false } })
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .populate("userId", "name avatar email"),
      this.model.countDocuments({ stationId: stationObjectId, isVisible: { $ne: false } }),
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
      { $match: { stationId: new Types.ObjectId(stationId), isVisible: { $ne: false } } },
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

  async findAdminModerationReviews(
    options: FindAdminReviewsOptions
  ): Promise<AdminModerationReviewsResult> {
    const page = Math.max(1, options.page || 1)
    const limit = Math.max(1, Math.min(100, options.limit || 10))
    const skip = (page - 1) * limit

    const filter: Record<string, unknown> = {}

    if (options.rating && options.rating >= 1 && options.rating <= 5) {
      filter.rating = options.rating
    }

    if (options.flaggedOnly) {
      filter.report_count = { $gt: 0 }
    }

    if (options.stationId && Types.ObjectId.isValid(options.stationId)) {
      filter.stationId = new Types.ObjectId(options.stationId)
    }

    if (options.startDate || options.endDate) {
      const dateFilter: Record<string, Date> = {}
      if (options.startDate) dateFilter.$gte = new Date(options.startDate)
      if (options.endDate) dateFilter.$lte = new Date(options.endDate)
      filter.createdAt = dateFilter
    }

    if (options.search && options.search.trim()) {
      filter.comment = { $regex: options.search.trim(), $options: "i" }
    }

    let sortCriteria: Record<string, 1 | -1>
    const sortVal = options.sortBy?.toLowerCase()
    if (sortVal === "lowest") {
      sortCriteria = { rating: 1, createdAt: -1 }
    } else if (sortVal === "highest") {
      sortCriteria = { rating: -1, createdAt: -1 }
    } else if (sortVal === "most_flagged") {
      sortCriteria = { report_count: -1, createdAt: -1 }
    } else {
      sortCriteria = { createdAt: -1 }
    }

    const [docs, total] = await Promise.all([
      this.model
        .find(filter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .populate<{
          userId: { _id: Types.ObjectId; name?: string; email?: string; avatar?: string }
          stationId: {
            _id: Types.ObjectId
            name?: string
            address?: { street?: string; city?: string; state?: string }
            images?: string[]
          }
          bookingId: {
            _id: Types.ObjectId
            bookingNumber?: string
            referenceId?: string
            serviceType?: string
            dateTime?: string
          }
        }>([
          { path: "userId", select: "name email avatar" },
          { path: "stationId", select: "name address images" },
          { path: "bookingId", select: "bookingNumber referenceId serviceType dateTime" },
        ])
        .exec(),
      this.model.countDocuments(filter),
    ])

    const items = docs.map((doc) => {
      const review = this.mapper.toDomain(doc as unknown as IReview)
      const user = doc.userId
        ? {
            name: (doc.userId as { name?: string }).name,
            email: (doc.userId as { email?: string }).email,
            avatar: (doc.userId as { avatar?: string }).avatar,
          }
        : undefined

      const stationDoc = doc.stationId as
        | {
            _id?: Types.ObjectId
            name?: string
            address?: { street?: string; city?: string; state?: string }
            images?: string[]
          }
        | undefined

      const station = stationDoc
        ? {
            id: stationDoc._id?.toString(),
            name: stationDoc.name,
            city: stationDoc.address?.city,
            state: stationDoc.address?.state,
            address: stationDoc.address
              ? `${stationDoc.address.street || ""}, ${stationDoc.address.city || ""}`.trim()
              : undefined,
            image: stationDoc.images?.[0],
          }
        : undefined

      const bookingDoc = doc.bookingId as
        | {
            _id?: Types.ObjectId
            bookingNumber?: string
            referenceId?: string
            serviceType?: string
            dateTime?: string
          }
        | undefined

      const booking = bookingDoc
        ? {
            id: bookingDoc._id?.toString(),
            bookingNumber: bookingDoc.bookingNumber || bookingDoc.referenceId || "WQ-Booking",
            serviceType: bookingDoc.serviceType,
            dateTime: bookingDoc.dateTime,
          }
        : undefined

      return { review, user, station, booking }
    })

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    }
  }

  async findProviderFeedbackReviews(
    options: FindProviderFeedbackOptions
  ): Promise<ProviderFeedbackReviewsResult> {
    const page = Math.max(1, options.page || 1)
    const limit = Math.max(1, Math.min(100, options.limit || 10))
    const skip = (page - 1) * limit

    if (!options.stationIds || options.stationIds.length === 0) {
      return { items: [], total: 0, page, limit, totalPages: 0 }
    }

    const validStationObjectIds = options.stationIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id))

    const filter: Record<string, unknown> = {
      stationId: { $in: validStationObjectIds },
    }

    if (options.stationId && Types.ObjectId.isValid(options.stationId)) {
      filter.stationId = new Types.ObjectId(options.stationId)
    }

    if (options.rating && options.rating >= 1 && options.rating <= 5) {
      filter.rating = options.rating
    }

    if (options.pillFilter === "LOW_RATED") {
      filter.rating = { $lte: 2 }
    }

    if (options.search && options.search.trim()) {
      filter.comment = { $regex: options.search.trim(), $options: "i" }
    }

    let sortCriteria: Record<string, 1 | -1>
    const sortVal = options.sortBy?.toLowerCase()
    if (sortVal === "lowest") {
      sortCriteria = { rating: 1, createdAt: -1 }
    } else if (sortVal === "highest") {
      sortCriteria = { rating: -1, createdAt: -1 }
    } else {
      sortCriteria = { createdAt: -1 }
    }

    const [docs, total] = await Promise.all([
      this.model
        .find(filter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .populate<{
          userId: { _id: Types.ObjectId; name?: string; email?: string; avatar?: string }
          stationId: {
            _id: Types.ObjectId
            name?: string
            address?: { street?: string; city?: string; state?: string }
            images?: string[]
          }
          bookingId: {
            _id: Types.ObjectId
            bookingNumber?: string
            referenceId?: string
            serviceType?: string
            dateTime?: string
          }
        }>([
          { path: "userId", select: "name email avatar" },
          { path: "stationId", select: "name address images" },
          { path: "bookingId", select: "bookingNumber referenceId serviceType dateTime" },
        ])
        .exec(),
      this.model.countDocuments(filter),
    ])

    const items = docs.map((doc) => {
      const review = this.mapper.toDomain(doc as unknown as IReview)
      const user = doc.userId
        ? {
            name: (doc.userId as { name?: string }).name,
            email: (doc.userId as { email?: string }).email,
            avatar: (doc.userId as { avatar?: string }).avatar,
          }
        : undefined

      const stationDoc = doc.stationId as
        | {
            _id?: Types.ObjectId
            name?: string
            address?: { street?: string; city?: string; state?: string }
            images?: string[]
          }
        | undefined

      const station = stationDoc
        ? {
            id: stationDoc._id?.toString(),
            name: stationDoc.name,
            city: stationDoc.address?.city,
            state: stationDoc.address?.state,
            address: stationDoc.address
              ? `${stationDoc.address.street || ""}, ${stationDoc.address.city || ""}`.trim()
              : undefined,
            image: stationDoc.images?.[0],
          }
        : undefined

      const bookingDoc = doc.bookingId as
        | {
            _id?: Types.ObjectId
            bookingNumber?: string
            referenceId?: string
            serviceType?: string
            dateTime?: string
          }
        | undefined

      const booking = bookingDoc
        ? {
            id: bookingDoc._id?.toString(),
            bookingNumber: bookingDoc.bookingNumber || bookingDoc.referenceId || "WQ-89422",
            serviceType: bookingDoc.serviceType,
            dateTime: bookingDoc.dateTime,
          }
        : undefined

      return { review, user, station, booking }
    })

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    }
  }

  async getAdminMetrics(options?: { startDate?: Date; endDate?: Date }) {
    const matchFilter: Record<string, unknown> = {}
    if (options?.startDate || options?.endDate) {
      const dateFilter: Record<string, Date> = {}
      if (options.startDate) dateFilter.$gte = new Date(options.startDate)
      if (options.endDate) dateFilter.$lte = new Date(options.endDate)
      matchFilter.createdAt = dateFilter
    }

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const [generalStats, ratingDist, stationAggregates] = await Promise.all([
      this.model.aggregate<{
        total: number
        avgRating: number
        lowRatingCount: number
        flaggedCount: number
        newThisMonth: number
      }>([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            avgRating: { $avg: "$rating" },
            lowRatingCount: {
              $sum: { $cond: [{ $lte: ["$rating", 2] }, 1, 0] },
            },
            flaggedCount: {
              $sum: { $cond: [{ $gt: ["$report_count", 0] }, 1, 0] },
            },
            newThisMonth: {
              $sum: { $cond: [{ $gte: ["$createdAt", startOfMonth] }, 1, 0] },
            },
          },
        },
      ]),
      this.model.aggregate<{ _id: number; count: number }>([
        { $match: matchFilter },
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 },
          },
        },
      ]),
      this.model.aggregate<{
        _id: Types.ObjectId
        avgRating: number
        reviewCount: number
      }>([
        { $match: matchFilter },
        {
          $group: {
            _id: "$stationId",
            avgRating: { $avg: "$rating" },
            reviewCount: { $sum: 1 },
          },
        },
        { $sort: { reviewCount: -1 } },
        {
          $lookup: {
            from: "stations",
            localField: "_id",
            foreignField: "_id",
            as: "stationDoc",
          },
        },
        { $unwind: { path: "$stationDoc", preserveNullAndEmptyArrays: true } },
      ]),
    ])

    const stats = generalStats[0] || {
      total: 0,
      avgRating: 0,
      lowRatingCount: 0,
      flaggedCount: 0,
      newThisMonth: 0,
    }

    const totalReviews = stats.total || 0
    const averageRating = totalReviews > 0 ? Math.round((stats.avgRating || 0) * 10) / 10 : 0

    // Rating Breakdown [5, 4, 3, 2, 1]
    const ratingCountMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratingDist.forEach((d) => {
      if (d._id >= 1 && d._id <= 5) {
        ratingCountMap[d._id] = d.count
      }
    })

    const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
      const count = ratingCountMap[stars] || 0
      const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
      return { stars, count, percentage }
    })

    // Most reviewed station
    const mostReviewedDoc = stationAggregates[0]
    const mostReviewedStation = {
      id: mostReviewedDoc?._id?.toString(),
      name:
        (mostReviewedDoc as unknown as { stationDoc?: { name?: string } })?.stationDoc?.name ||
        "Downtown Hub 04",
      reviewCount: mostReviewedDoc?.reviewCount || 0,
    }

    // Top rated vs low rated station lists
    const sortedByRating = [...stationAggregates].sort((a, b) => b.avgRating - a.avgRating)

    const mapPerformance = (
      item: (typeof stationAggregates)[0]
    ): {
      id: string
      name: string
      location: string
      rating: number
      reviewCount: number
      performanceTag: "PEAK" | "STABLE" | "AT RISK" | "NEEDS ATTENTION"
    } => {
      const sDoc = (
        item as unknown as { stationDoc?: { name?: string; address?: { city?: string } } }
      )?.stationDoc
      const r = Math.round((item.avgRating || 0) * 10) / 10
      let tag: "PEAK" | "STABLE" | "AT RISK" | "NEEDS ATTENTION"
      if (r >= 4.8) tag = "PEAK"
      else if (r >= 4.0) tag = "STABLE"
      else if (r < 3.0) tag = "AT RISK"
      else tag = "NEEDS ATTENTION"

      return {
        id: item._id?.toString() || "",
        name: sDoc?.name || "Station Hub",
        location: sDoc?.address?.city || "City Area",
        rating: r,
        reviewCount: item.reviewCount || 0,
        performanceTag: tag,
      }
    }

    const topRatedStations = sortedByRating.slice(0, 5).map(mapPerformance)
    const lowRatedStations = [...sortedByRating].reverse().slice(0, 5).map(mapPerformance)

    return {
      averageRating,
      ratingChange: 0.2,
      totalReviews,
      newThisMonth: stats.newThisMonth || 0,
      lowRatingCount: stats.lowRatingCount || 0,
      flaggedCount: stats.flaggedCount || 0,
      mostReviewedStation,
      ratingBreakdown,
      topRatedStations,
      lowRatedStations,
    }
  }
}
