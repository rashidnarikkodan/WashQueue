import { PaginationMeta } from "@/common/types/pagination"
import {
  BookingStatus,
  PaymentStatus,
  PaymentType,
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
  providerId: string
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
  rawQrToken?: string // Only populated upon creation for caller
  qr: {
    qrExpiresAt: string
  }
  paymentStatus: PaymentStatus
  paymentType: PaymentType
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
  statusHistory?: BookingStatusLogDTO[]
  createdAt: string
  updatedAt: string
}

export interface BookingListResponseDTO {
  bookings: BookingResponseDTO[]
  pagination: PaginationMeta
}

