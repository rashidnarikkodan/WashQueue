export const StationSortBy = {
  RECOMMENDED: "RECOMMENDED",
  DISTANCE: "DISTANCE",
  RATING: "RATING",
  PRICE_LOW_TO_HIGH: "PRICE_LOW_TO_HIGH",
  PRICE_HIGH_TO_LOW: "PRICE_HIGH_TO_LOW",
  WAIT_TIME: "WAIT_TIME",
  REVIEW_COUNT: "REVIEW_COUNT",
  NEWEST: "NEWEST",
  // Backward compatibility alias keys:
  nearest: "DISTANCE",
  rating: "RATING",
  fastest: "WAIT_TIME",
  popular: "REVIEW_COUNT",
} as const

export type StationSortBy =
  | keyof typeof StationSortBy
  | (typeof StationSortBy)[keyof typeof StationSortBy]

export const STATION_SORT_BY = StationSortBy

export type WashType = "HALF" | "FULL" | "ALL"

export interface GetStationsQuery {
  // Location
  latitude?: number
  longitude?: number
  maxDistanceKm?: number
  radiusKm?: number

  // Search & Status
  search?: string
  status?: string
  ownerId?: string

  // Vehicle & Category
  vehicleCategory?: string
  vehicleClassId?: string

  // Pricing
  washType?: WashType
  minPrice?: number
  maxPrice?: number
  minHalfWashPrice?: number
  maxHalfWashPrice?: number
  minFullWashPrice?: number
  maxFullWashPrice?: number

  // Rating
  minRating?: number
  minimumRating?: number

  // Extra Filters
  amenities?: string[]
  extraServices?: string[]
  extraServiceIds?: string[]

  openNow?: boolean
  availableToday?: boolean
  verifiedOnly?: boolean
  isActive?: boolean

  // Sorting
  sortBy?: StationSortBy | string
  sortOrder?: "asc" | "desc"

  // Pagination
  page?: number
  limit?: number
}

export interface StationStatusCounts {
  all: number
  draft: number
  pending: number
  active: number
  inactive: number
  suspended: number
  rejected: number
}
