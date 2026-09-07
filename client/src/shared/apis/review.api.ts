import { api } from "@/shared/config/axios"
import { API_ROUTES } from "@/shared/constants/api.const"
import { handleApiError } from "@/shared/utils/handleApiError"
import type {
  CreateReviewPayload,
  ReviewDto,
  StationReviewsDto,
  UpdateReviewPayload,
  UserReviewsDto,
} from "../types/review.types"

export const reviewApi = {
  createReview: async (payload: CreateReviewPayload): Promise<ReviewDto> => {
    try {
      const response = await api.post(API_ROUTES.REVIEWS.ROOT, payload)
      return response.data?.data
    } catch (error) {
      handleApiError(error, "Failed to submit review")
    }
  },

  updateReview: async (id: string, payload: UpdateReviewPayload): Promise<ReviewDto> => {
    try {
      const response = await api.put(API_ROUTES.REVIEWS.BY_ID(id), payload)
      return response.data?.data
    } catch (error) {
      handleApiError(error, "Failed to update review")
    }
  },

  getById: async (id: string): Promise<ReviewDto> => {
    try {
      const response = await api.get(API_ROUTES.REVIEWS.BY_ID(id), { skipToast: true })
      return response.data?.data
    } catch (error) {
      handleApiError(error, "Failed to load review")
    }
  },

  getByBooking: async (bookingId: string): Promise<ReviewDto | null> => {
    try {
      const response = await api.get(API_ROUTES.REVIEWS.BY_BOOKING(bookingId), { skipToast: true })
      return response.data?.data || null
    } catch {
      // Return null quietly if not reviewed
      return null
    }
  },

  getStationReviews: async (
    stationId: string,
    page?: number,
    limit?: number,
    sortBy?: "LATEST" | "HIGHEST" | "LOWEST"
  ): Promise<StationReviewsDto> => {
    try {
      const response = await api.get(API_ROUTES.REVIEWS.BY_STATION(stationId), {
        params: { page, limit, sortBy },
        skipToast: true,
      })
      return (
        response.data?.data || {
          reviews: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          averageRating: 0,
          reviewCount: 0,
        }
      )
    } catch (error) {
      handleApiError(error, "Failed to load station reviews")
    }
  },

  getMyReviews: async (page?: number, limit?: number): Promise<UserReviewsDto> => {
    try {
      const response = await api.get(API_ROUTES.REVIEWS.MY_REVIEWS, {
        params: { page, limit },
        skipToast: true,
      })
      return (
        response.data?.data || {
          reviews: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        }
      )
    } catch (error) {
      handleApiError(error, "Failed to load user reviews")
    }
  },

  deleteReview: async (id: string): Promise<void> => {
    try {
      await api.delete(API_ROUTES.REVIEWS.BY_ID(id))
    } catch (error) {
      handleApiError(error, "Failed to delete review")
    }
  },
}
