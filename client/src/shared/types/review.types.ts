export interface ReviewDto {
  id: string
  userId: string
  ownerId: string
  stationId: string
  bookingId: string
  rating: number
  comment: string
  updateCount: number
  createdAt?: string
  updatedAt?: string
  user?: {
    name?: string
    avatar?: string
    email?: string
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
