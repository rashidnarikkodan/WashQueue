import type { PaymentMethod } from "@/shared/constants/payment.constants"
export interface CreateBookingInput {
  stationId: string
  vehicleId: string
  timeWindowId: string
  serviceType: "HALF" | "FULL"
  extraServiceIds?: string[]
  paymentMethod?: PaymentMethod
}

export interface InspectionChecklistItem {
  key: string
  label: string
  passed: boolean
  remark?: string
}

export interface InspectionPhoto {
  position: string
  public_id: string
  secured_url: string
}

export interface BookingStatusHistoryItem {
  id: string
  bookingId: string
  fromStatus: string | null
  toStatus: string
  changedBy: string
  reason?: string
  notes?: string
  createdAt: string
}

export interface BookingResponse {
  id: string
  bookingNumber: string
  userId?: string | null
  ownerId: string
  stationId: string
  vehicleId?: string | null
  vehicleSnapshot?: {
    vehicleCategoryId: string
    vehicleClassId: string
  }
  serviceType: "HALF" | "FULL"
  pricingSnapshot: {
    basePrice: number
    extraPrice: number
    totalPrice: number
    currency: string
  }
  scheduling: {
    timeWindowId: string
    windowStart: string
    windowEnd: string
  }
  stationDetails?: {
    name?: string
    city?: string
    phone?: string
    images?: Array<{ url: string; isPrimary?: boolean; caption?: string }>
  }
  vehicleDetails?: {
    nickname?: string
    brand?: string
    model?: string
    registrationNumber?: string
  }
  customerDetails?: {
    name?: string
    email?: string
    phone?: string
  }
  walkInCustomer?: {
    name?: string
    phone?: string
  } | null
  walkInVehicle?: {
    registrationNumber?: string
    categoryId?: string
    classId?: string
  } | null
  extraServices?: Array<{
    serviceId: string
    name: string
    price: number
  }>
  isWalkIn?: boolean
  rescheduleCount?: number
  checkedInAt?: string | null
  serviceStartedAt?: string | null
  serviceCompletedAt?: string | null
  completedAt?: string | null
  cancellation?: {
    cancellationReason?: string
    cancelledBy?: string
    cancelledAt?: string
  } | null
  settlementOutcome?: {
    status: string
    amount?: number
    payoutId?: string
    holdReason?: string
    failureReason?: string
  }
  rawQrToken?: string
  preServiceInspection?: {
    photos: InspectionPhoto[]
    notes?: string
    capturedBy: string
    capturedAt: string
  } | null
  postServiceInspection?: {
    photos: InspectionPhoto[]
    notes?: string
    capturedBy: string
    capturedAt: string
    checklist?: InspectionChecklistItem[]
  } | null
  status: string
  paymentStatus: string
  paymentMethod: string
  depositAmount: number
  cashAmount: number
  statusHistory?: BookingStatusHistoryItem[]
  estimatedServiceDurationMinutes?: number
  serviceDurationBreakdown?: {
    baseMinutes: number
    extraServicesMinutes: number
    vehicleClassModifierMinutes: number
    totalEstimatedMinutes: number
  }
  createdAt: string
  updatedAt: string
}

export interface GetUserBookingsParams {
  type?: "upcoming" | "history" | "all" | "noshow"
  page?: number
  limit?: number
  status?: string
  stationId?: string
  ownerId?: string
  q?: string
  startDate?: string
  endDate?: string
  mine?: boolean
}

export interface BookingListApiResponse {
  bookings: BookingResponse[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface CloudinarySignatureResponse {
  signature: string
  timestamp: number
  folder: string
  apiKey: string
  cloudName: string
}
