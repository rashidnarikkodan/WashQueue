export interface ReviewDto {
  id: string
  userId: string
  ownerId: string
  stationId: string
  bookingId: string
  rating: number
  comment: string
  updateCount: number
  isVisible?: boolean
  reportCount?: number
  flags?: string[]
  createdAt?: string
  updatedAt?: string
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
    vehicleNumber?: string
  }
}

export interface CreateReviewPayload {
  bookingId: string
  rating: number
  comment?: string
}

export interface UpdateReviewPayload {
  rating: number
  comment?: string
}

export interface StationReviewsDto {
  reviews: ReviewDto[]
  total: number
  page: number
  limit: number
  totalPages: number
  averageRating: number
  reviewCount: number
}

export interface UserReviewsDto {
  reviews: ReviewDto[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ReviewPromptData {
  bookingId: string
  stationId: string
  stationName?: string
  stationImage?: string
  serviceType?: string
  dateTime?: string
  bookingNumber?: string
}

export interface RatingBreakdownItem {
  stars: number
  count: number
  percentage: number
}

export interface StationPerformanceItem {
  id: string
  name: string
  location: string
  rating: number
  reviewCount: number
  performanceTag: "PEAK" | "STABLE" | "AT RISK" | "NEEDS ATTENTION"
}

export interface AdminReviewMetrics {
  averageRating: number
  ratingChange: number
  totalReviews: number
  newThisMonth: number
  lowRatingCount: number
  flaggedCount: number
  mostReviewedStation: {
    id?: string
    name: string
    reviewCount: number
  }
  ratingBreakdown: RatingBreakdownItem[]
  topRatedStations: StationPerformanceItem[]
  lowRatedStations: StationPerformanceItem[]
}

export interface AdminReviewModerationResponse {
  reviews: ReviewDto[]
  total: number
  page: number
  limit: number
  totalPages: number
  metrics: AdminReviewMetrics
}

export interface FindAdminReviewsParams {
  page?: number
  limit?: number
  search?: string
  stationSearch?: string
  stationId?: string
  rating?: number
  flaggedOnly?: boolean
  sortBy?: "lowest" | "highest" | "recent" | "most_flagged" | string
  startDate?: string
  endDate?: string
}

export interface ProviderStationOption {
  id: string
  name: string
}

export interface ProviderFeedbackResponse {
  reviews: ReviewDto[]
  total: number
  page: number
  limit: number
  totalPages: number
  stations: ProviderStationOption[]
}

export interface FindProviderFeedbackParams {
  page?: number
  limit?: number
  search?: string
  stationId?: string
  rating?: number
  pillFilter?: "ALL" | "LOW_RATED" | string
  sortBy?: "lowest" | "highest" | "recent" | string
}
