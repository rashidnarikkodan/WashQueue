import { PaginationMeta } from "@/common/types/pagination"
import {
  BookingStatus,
  PaymentStatus,
  PaymentMethod,
  ServiceType,
} from "../../domain/entities/Booking"

export interface BookingStatusLogDTO {
  id: string
  bookingId: string
  fromStatus: BookingStatus | null
  toStatus: BookingStatus
  changedBy: string
  reason?: string
  notes?: string
  createdAt: string
}

export interface BookingResponseDTO {
  id: string
  bookingNumber: string
  userId?: string | null
  ownerId: string
  stationId: string
  vehicleId?: string | null
  vehicleSnapshot: {
    vehicleCategoryId: string
    vehicleClassId: string
  }
  serviceType: ServiceType
  pricingSnapshot: {
    basePrice: number
    extraPrice: number
    totalPrice: number
    currency: string
  }
  extraServices: Array<{
    serviceId: string
    name: string
    price: number
  }>
  scheduling: {
    timeWindowId: string
    windowStart: string
    windowEnd: string
  }
  isWalkIn: boolean
  walkInCustomer?: {
    userId?: string
    name: string
    phone: string
  } | null
  walkInVehicle?: {
    vehicleId?: string
    registrationNumber: string
    categoryId: string
    classId: string
  } | null
  rawQrToken?: string
  qr: {
    qrExpiresAt: string
  }
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  depositAmount: number
  cashAmount: number
  refundAmount: number
  settlement: {
    platformCommission: number
    stationSettlement: number
  }
  status: BookingStatus
  checkedInAt?: string | null
  serviceStartedAt?: string | null
  serviceCompletedAt?: string | null
  handoverInitiatedAt?: string | null
  completedAt?: string | null
  noShowAt?: string | null
  cancellation?: {
    cancellationReason: string
    cancelledBy: string
    cancelledAt: string
  } | null
  stationDetails?: {
    name?: string
    city?: string
    phone?: string
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
  preServiceInspection?: {
    photos: Array<{ position: string; public_id: string; secured_url: string }>
    notes?: string
    capturedBy: string
    capturedAt: string
  } | null
  postServiceInspection?: {
    photos: Array<{ position: string; public_id: string; secured_url: string }>
    notes?: string
    capturedBy: string
    capturedAt: string
    checklist?: Array<{
      key: string
      label: string
      passed: boolean
      remark?: string
    }>
  } | null
  statusHistory?: BookingStatusLogDTO[]
  rescheduleCount?: number
  estimatedServiceDurationMinutes?: number
  serviceDurationBreakdown?: {
    baseMinutes: number
    extraServicesMinutes: number
    vehicleClassModifierMinutes: number
    totalEstimatedMinutes: number
  }
  settlementOutcome?: {
    status: string
    amount?: number
    transferId?: string
    holdReason?: string
    failureReason?: string
  }
  createdAt: string
  updatedAt: string
}

export interface BookingListResponseDTO {
  bookings: BookingResponseDTO[]
  pagination: PaginationMeta
}
