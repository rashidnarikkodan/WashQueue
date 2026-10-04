export interface CreateReviewDTO {
  bookingId: string
  rating: number
  comment?: string
}

export interface UpdateReviewDTO {
  rating: number
  comment?: string
}

export interface ReviewResponseDTO {
  id: string
  userId: string
  ownerId: string
  stationId: string
  bookingId: string
  rating: number
  comment: string
  updateCount: number
  isVisible: boolean
  reportCount: number
  flags: string[]
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
    dateTime?: string
  }
}

export interface ProviderStationOption {
  id: string
  name: string
}

export interface ProviderFeedbackResponseDTO {
  reviews: ReviewResponseDTO[]
  total: number
  page: number
  limit: number
  totalPages: number
  stations: ProviderStationOption[]
}

export interface StationReviewsResponseDTO {
  reviews: ReviewResponseDTO[]
  total: number
  page: number
  limit: number
  totalPages: number
  averageRating: number
  reviewCount: number
}

export interface UserReviewsResponseDTO {
  reviews: ReviewResponseDTO[]
  total: number
  page: number
  limit: number
  totalPages: number
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

export interface AdminReviewMetricsDTO {
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

export interface AdminReviewModerationResponseDTO {
  reviews: ReviewResponseDTO[]
  total: number
  page: number
  limit: number
  totalPages: number
  metrics: AdminReviewMetricsDTO
}

export interface ReportReviewDTO {
  reason: string
}

export interface ToggleReviewVisibilityDTO {
  isVisible: boolean
}
