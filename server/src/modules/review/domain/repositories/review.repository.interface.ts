import { IBaseRepository } from "@/core/domain/repository.interface"
import { Review } from "../entities/Review"

export interface FindReviewsOptions {
  page?: number
  limit?: number
  sortBy?: string
}

export interface StationReviewsResult {
  reviews: Review[]
  total: number
  page: number
  limit: number
  totalPages: number
  averageRating: number
  reviewCount: number
}

export interface UserReviewsResult {
  reviews: Review[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface StationRatingSummary {
  averageRating: number
  reviewCount: number
}

export interface FindAdminReviewsOptions {
  page?: number
  limit?: number
  search?: string
  stationSearch?: string
  stationId?: string
  rating?: number
  flaggedOnly?: boolean
  sortBy?: "lowest" | "highest" | "recent" | "most_flagged" | string
  startDate?: Date
  endDate?: Date
}

export interface PopulatedReviewItem {
  review: Review
  user?: {
    name?: string
    avatar?: string
    email?: string
  }
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

export interface AdminModerationReviewsResult {
  items: PopulatedReviewItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface FindProviderFeedbackOptions {
  stationIds: string[]
  page?: number
  limit?: number
  search?: string
  stationId?: string
  rating?: number
  pillFilter?: "ALL" | "LOW_RATED" | string
  sortBy?: "lowest" | "highest" | "recent" | string
}

export interface ProviderFeedbackReviewsResult {
  items: PopulatedReviewItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface IReviewRepository extends IBaseRepository<Review> {
  create?(review: Review): Promise<Review>
  update(id: string, updates: Partial<Review>): Promise<Review | null>
  findByBookingId(bookingId: string): Promise<Review | null>
  findByStationId(stationId: string, options?: FindReviewsOptions): Promise<StationReviewsResult>
  findByUserId(userId: string, options?: FindReviewsOptions): Promise<UserReviewsResult>
  getStationRatingSummary(stationId: string): Promise<StationRatingSummary>
  findAdminModerationReviews(
    options: FindAdminReviewsOptions
  ): Promise<AdminModerationReviewsResult>
  findProviderFeedbackReviews(
    options: FindProviderFeedbackOptions
  ): Promise<ProviderFeedbackReviewsResult>
  getAdminMetrics(options?: { startDate?: Date; endDate?: Date }): Promise<{
    averageRating: number
    ratingChange: number
    totalReviews: number
    newThisMonth: number
    lowRatingCount: number
    flaggedCount: number
    mostReviewedStation: { id?: string; name: string; reviewCount: number }
    ratingBreakdown: { stars: number; count: number; percentage: number }[]
    topRatedStations: {
      id: string
      name: string
      location: string
      rating: number
      reviewCount: number
      performanceTag: "PEAK" | "STABLE" | "AT RISK" | "NEEDS ATTENTION"
    }[]
    lowRatedStations: {
      id: string
      name: string
      location: string
      rating: number
      reviewCount: number
      performanceTag: "PEAK" | "STABLE" | "AT RISK" | "NEEDS ATTENTION"
    }[]
  }>
}
