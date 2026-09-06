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
  createdAt?: string
  updatedAt?: string
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
