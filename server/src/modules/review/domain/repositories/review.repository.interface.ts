import { Review } from "../entities/Review"

export interface FindReviewsOptions {
  page?: number
  limit?: number
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

export interface IReviewRepository {
  create(review: Review): Promise<Review>
  update(review: Review): Promise<Review>
  findById(id: string): Promise<Review | null>
  findByBookingId(bookingId: string): Promise<Review | null>
  findByStationId(stationId: string, options?: FindReviewsOptions): Promise<StationReviewsResult>
  findByUserId(userId: string, options?: FindReviewsOptions): Promise<UserReviewsResult>
  delete(id: string): Promise<void>
  getStationRatingSummary(stationId: string): Promise<StationRatingSummary>
}
