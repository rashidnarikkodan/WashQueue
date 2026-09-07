import { api } from "@/shared/config/axios"
import { API_ROUTES } from "@/shared/constants/api.const"
import { handleApiError } from "@/shared/utils/handleApiError"
import type {
  AdminReviewModerationResponse,
  CreateReviewPayload,
  FindAdminReviewsParams,
  FindProviderFeedbackParams,
  ProviderFeedbackResponse,
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

  getAdminModeration: async (
    params: FindAdminReviewsParams = {}
  ): Promise<AdminReviewModerationResponse> => {
    try {
      const response = await api.get(API_ROUTES.REVIEWS.ADMIN_MODERATION, {
        params,
        skipToast: true,
      })
      return (
        response.data?.data || {
          reviews: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          metrics: {
            averageRating: 0,
            ratingChange: 0,
            totalReviews: 0,
            newThisMonth: 0,
            lowRatingCount: 0,
            flaggedCount: 0,
            mostReviewedStation: { name: "", reviewCount: 0 },
            ratingBreakdown: [],
            topRatedStations: [],
            lowRatedStations: [],
          },
        }
      )
    } catch (error) {
      handleApiError(error, "Failed to load admin moderation data")
      throw error
    }
  },

  toggleVisibility: async (id: string, isVisible: boolean): Promise<ReviewDto> => {
    try {
      const response = await api.patch(API_ROUTES.REVIEWS.TOGGLE_VISIBILITY(id), { isVisible })
      return response.data?.data
    } catch (error) {
      handleApiError(error, "Failed to update review visibility")
      throw error
    }
  },

  dismissReports: async (id: string): Promise<ReviewDto> => {
    try {
      const response = await api.patch(API_ROUTES.REVIEWS.DISMISS_REPORTS(id))
      return response.data?.data
    } catch (error) {
      handleApiError(error, "Failed to dismiss review reports")
      throw error
    }
  },

  reportReview: async (id: string, reason: string): Promise<ReviewDto> => {
    try {
      const response = await api.post(API_ROUTES.REVIEWS.REPORT(id), { reason })
      return response.data?.data
    } catch (error) {
      handleApiError(error, "Failed to report review")
      throw error
    }
  },

  deleteReview: async (id: string): Promise<void> => {
    try {
      await api.delete(API_ROUTES.REVIEWS.BY_ID(id))
    } catch (error) {
      handleApiError(error, "Failed to delete review")
      throw error
    }
  },

  getProviderFeedback: async (
    params: FindProviderFeedbackParams = {}
  ): Promise<ProviderFeedbackResponse> => {
    try {
      const response = await api.get(API_ROUTES.REVIEWS.PROVIDER_FEEDBACK, {
        params,
        skipToast: true,
      })
      return (
        response.data?.data || {
          reviews: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          stations: [],
        }
      )
    } catch (error) {
      handleApiError(error, "Failed to load customer feedback")
      throw error
    }
  },
}
