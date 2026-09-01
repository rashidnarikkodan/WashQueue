import { SettlementStatus } from "../../domain/entities/Settlement"

export interface CreateSettlementDTO {
  bookingId: string
  ownerId: string
  stationId?: string
  totalAmount: number
  platformCommission: number
  platformCommissionRate?: number
  stationSettlementAmount: number
  currency?: string
}

export interface SettlementFilterOptions {
  ownerId?: string
  stationId?: string
  status?: SettlementStatus | SettlementStatus[]
  startDate?: Date
  endDate?: Date
  search?: string
  page?: number
  limit?: number
}

export interface SettlementResponseDTO {
  id: string
  bookingId: string
  ownerId: string
  stationId?: string
  totalAmount: number
  platformCommission: number
  platformCommissionRate?: number
  stationSettlementAmount: number
  currency: string
  status: SettlementStatus
  transferId?: string
  holdReason?: string
  failureReason?: string
  retryCount: number
  lastRetriedAt?: string
  settledAt?: string
  createdAt: string
  updatedAt?: string

  // Populated metadata if available
  bookingNumber?: string
  stationName?: string
  customerName?: string
  vehicleRegNumber?: string
  serviceName?: string
  paymentMethod?: string
}

export interface OwnerEarningsSummaryDTO {
  totalGrossRevenue: number
  totalPlatformCommission: number
  totalNetEarnings: number
  settledAmount: number
  pendingAmount: number
  processingAmount: number
  heldAmount: number
  failedAmount: number
  completedBookingsCount: number
  payoutAccountStatus: {
    hasLinkedAccount: boolean
    transferId?: string
    bankName?: string
    accountNumberMasked?: string
    accountHolderName?: string
  }
}

export interface AdminSettlementMetricsDTO {
  totalPlatformCommission: number
  totalGrossVolume: number
  totalSettledAmount: number
  totalPendingAmount: number
  totalHeldAmount: number
  totalFailedAmount: number
  totalSettlementsCount: number
  pendingCount: number
  heldCount: number
  failedCount: number
  settledCount: number
}

export interface SettlementPaginationDTO<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
