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


export interface Station {
  id: string
  ownerId: string
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
  operatingHours: {
    day: string
    open: string
    close: string
    isClosed: boolean
  }[]
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
    bufferBetweenWindowsMins: number
    allowWalkIns: boolean
  }
  amenities: string[]
  rating: number
  reviewCount: number
  verifiedAt?: string
  rejectionReason?: string
  status: StationStatus
  isActive: boolean
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

export interface GetStationsQuery {
  page?: number
  limit?: number
  search?: string
  status?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  ownerId?: string
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
  operatingHours: {
    day: string
    open: string
    close: string
    isClosed: boolean
  }[]
  holidays: { date: string; reason?: string }[]
  slotConfig: {
    bays: number
    windowDurationMins: number
    capacityPerWindow: number
    walkInReservedSlots: number
    maxAdvanceBookingDays: number
    bufferBetweenWindowsMins: number
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
