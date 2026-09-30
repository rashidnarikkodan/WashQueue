import { InspectionChecklistItem, InspectionPhoto } from "@/modules/booking/domain/entities/Booking"

export interface SavePreInspectionInput {
  bookingId: string
  photos?: InspectionPhoto[]
  notes?: string
}

export interface SavePostInspectionInput {
  bookingId: string
  photos?: InspectionPhoto[]
  notes?: string
  checklist?: InspectionChecklistItem[]
}

export interface StallBookingInput {
  bookingId: string
  reason: string
}

export interface ResolveStalledBookingInput {
  bookingId: string
  resolution: string
  targetStatus?: "CHECKED_IN" | "IN_SERVICE" | "CANCELLED"
}

export interface PublicQueueItemDTO {
  id: string
  bookingNumber: string
  position?: number
  bayNumber?: number
  vehicle: string
  package: string
  serviceType: string
  status: string
  serviceStartedAt?: string
  estimatedWaitMinutes?: number
  estimatedServiceStart?: string
  isBayActive: boolean
}

export interface PublicStationQueueDTO {
  stationId: string
  stationName: string
  totalBays: number
  activeServicesCount: number
  availableBays: number
  queueDepth: number
  totalActiveAndWaiting: number
  averageWashDurationMinutes: number
  activeServices: PublicQueueItemDTO[]
  waitingQueue: PublicQueueItemDTO[]
}

export interface ProcessNoShowResult {
  processedCount: number
  noShowBookingIds: string[]
}
