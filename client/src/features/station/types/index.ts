export const StationStatus = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
  REJECTED: "REJECTED",
} as const

export type StationStatus = (typeof StationStatus)[keyof typeof StationStatus]

export const STATION_STATUS = StationStatus

export interface OperatingBreak {
  name?: string
  start: string
  end: string
}

export interface OperatingHourDay {
  day: string
  open: string
  close: string
  isClosed: boolean
  breaks?: OperatingBreak[]
}

export interface Station {
  id: string
  ownerId: string
  managerId?: string
  name: string
  description: string
  contact: {
    phone: string
    email: string
  }
  location: {
    latitude: number
    longitude: number
  }
  address: {
    street: string
    city: string
    state: string
    country: string
    pincode: string
  }
  images: {
    url: string
    publicId: string
    isPrimary: boolean
  }[]
  operatingHours: OperatingHourDay[]
  holidays: {
    date: string
    reason?: string
  }[]
  slotConfig: {
    bays: number
    windowDurationMins: number
    capacityPerWindow: number
    walkInReservedSlots: number
    maxAdvanceBookingDays: number
    allowWalkIns: boolean
  }
  amenities: string[]
  rating: number
  reviewCount: number
  verifiedAt?: string
  rejectionReason?: string
  status: StationStatus
  isActive: boolean
  distanceKm?: number
  createdAt: string
  updatedAt: string
}

export interface StationPricing {
  id: string
  stationId: string
  vehicleClassId: string
  halfWashPrice: number
  fullWashPrice: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ExtraService {
  id: string
  stationId: string
  name: string
  slug: string
  description?: string
  pricing: { vehicleClassId: string; price: number }[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface StationDetail {
  station: Station
  pricing: StationPricing[]
  extraServices: ExtraService[]
}

export const StationSortBy = {
  RECOMMENDED: 'RECOMMENDED',
  DISTANCE: 'DISTANCE',
  RATING: 'RATING',
  PRICE_LOW_TO_HIGH: 'PRICE_LOW_TO_HIGH',
  PRICE_HIGH_TO_LOW: 'PRICE_HIGH_TO_LOW',
  WAIT_TIME: 'WAIT_TIME',
  REVIEW_COUNT: 'REVIEW_COUNT',
  NEWEST: 'NEWEST',
  // Backward compatibility alias keys:
  nearest: 'DISTANCE',
  rating: 'RATING',
  fastest: 'WAIT_TIME',
  popular: 'REVIEW_COUNT',
} as const

export type StationSortBy = keyof typeof StationSortBy | (typeof StationSortBy)[keyof typeof StationSortBy]

export const STATION_SORT_BY = StationSortBy

export type WashType = 'HALF' | 'FULL' | 'ALL'

export interface GetStationsQuery {
  // Location
  latitude?: number
  longitude?: number
  radiusKm?: number
  maxDistanceKm?: number

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

  // Rating
  minRating?: number
  minimumRating?: number

  // Filters
  amenities?: string[]
  extraServices?: string[]
  openNow?: boolean
  availableToday?: boolean
  verifiedOnly?: boolean

  // Sorting
  sortBy?: StationSortBy | string
  sortOrder?: 'asc' | 'desc'

  // Pagination
  page?: number
  limit?: number
}

export interface GetStationsResponse {
  stations: Station[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface FilterMetadata {
  vehicleCategories: Array<{ id: string; slug: string; name: string }>
  vehicleClasses: Array<{ id: string; categoryId: string; slug: string; name: string }>
  amenities: Array<{ slug: string; name: string; icon: string }>
  priceBounds: { minPrice: number; maxPrice: number; currency: string }
  sortOptions: Array<{ value: string; label: string }>
}

export interface CreateStationResponse {
  stationId: string
  station: Station
}

// --- Input types matching server DTOs ---

export interface StationImage {
  url: string
  publicId: string
  isPrimary: boolean
}

export interface CreateStationInput {
  name: string
  description?: string
  contact: {
    phone: string
    email: string
  }
  location: {
    latitude: number
    longitude: number
  }
  address: {
    street: string
    city: string
    state: string
    country: string
    pincode: string
  }
  images: StationImage[]
}

export interface UpdateBasicInfoInput {
  step: 1
  name?: string
  description?: string
  contact?: {
    phone: string
    email: string
  }
  location?: {
    latitude: number
    longitude: number
  }
  address?: {
    street: string
    city: string
    state: string
    country: string
    pincode: string
  }
  images?: StationImage[]
  deletedImagePublicIds?: string[]
  status?: StationStatus
}

export interface UpdateAvailabilityInput {
  step: 2
  operatingHours: OperatingHourDay[]
  holidays: { date: string; reason?: string }[]
  slotConfig: {
    bays: number
    windowDurationMins: number
    capacityPerWindow: number
    walkInReservedSlots: number
    maxAdvanceBookingDays: number
    allowWalkIns: boolean
  }
}

export interface PricingEntryInput {
  vehicleClassId: string
  halfWashPrice: number
  fullWashPrice: number
  isActive?: boolean
}

export interface UpdatePricingInput {
  step: 3
  pricing: PricingEntryInput[]
}

export interface ExtraServiceInput {
  id?: string
  name: string
  slug?: string
  description?: string
  pricing: { vehicleClassId: string; price: number }[]
  isActive: boolean
  isDeleted?: boolean
}

export interface UpdateAmenitiesInput {
  step: 4
  amenities: string[]
  extraServices?: ExtraServiceInput[]
}

export type UpdateStationInput =
  | UpdateBasicInfoInput
  | UpdateAvailabilityInput
  | UpdatePricingInput
  | UpdateAmenitiesInput

export interface FilterOptions {
  sortBy: StationSortBy | string
  vehicleCategory: string
  maxDistanceKm: number
  minRating: number
  minPrice?: number
  maxPrice?: number
  amenities?: string[]
  openNow?: boolean
  verifiedOnly?: boolean
  latitude?: number
  longitude?: number
  search?: string
}

export const DEFAULT_FILTERS: FilterOptions = {
  sortBy: "RECOMMENDED",
  vehicleCategory: "all",
  maxDistanceKm: 25,
  minRating: 0,
  openNow: false,
}

