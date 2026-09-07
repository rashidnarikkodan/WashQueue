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

export interface IReviewRepository extends IBaseRepository<Review> {
  create?(review: Review): Promise<Review>
  update(id: string, updates: Partial<Review>): Promise<Review | null>
  findByBookingId(bookingId: string): Promise<Review | null>
  findByStationId(stationId: string, options?: FindReviewsOptions): Promise<StationReviewsResult>
  findByUserId(userId: string, options?: FindReviewsOptions): Promise<UserReviewsResult>
  getStationRatingSummary(stationId: string): Promise<StationRatingSummary>
}
