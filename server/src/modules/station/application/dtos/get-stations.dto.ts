export const StationSortBy = {
  RECOMMENDED: "RECOMMENDED",
  DISTANCE: "DISTANCE",
  RATING: "RATING",
  PRICE_LOW_TO_HIGH: "PRICE_LOW_TO_HIGH",
  PRICE_HIGH_TO_LOW: "PRICE_HIGH_TO_LOW",
  WAIT_TIME: "WAIT_TIME",
  REVIEW_COUNT: "REVIEW_COUNT",
  NEWEST: "NEWEST",
  nearest: "DISTANCE",
  rating: "RATING",
  fastest: "WAIT_TIME",
  popular: "REVIEW_COUNT",
} as const

export type StationSortBy =
  keyof typeof StationSortBy | (typeof StationSortBy)[keyof typeof StationSortBy]

export const STATION_SORT_BY = StationSortBy

export type WashType = "HALF" | "FULL" | "ALL"

export interface GetStationsQuery {
  latitude?: number
  longitude?: number
  maxDistanceKm?: number

  search?: string
  status?: string
  ownerId?: string

  vehicleCategory?: string
  vehicleClassId?: string

  minRating?: number

  openNow?: boolean
  availableToday?: boolean
  verifiedOnly?: boolean
  isActive?: boolean

  sortBy?: StationSortBy | string
  sortOrder?: "asc" | "desc"

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
