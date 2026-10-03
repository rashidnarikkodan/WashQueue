export type SettlementStatus =
  "PENDING" | "PROCESSING" | "PROCESSED" | "HELD" | "FAILED" | "REVERSED"

export interface Settlement {
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
  payoutId?: string
  holdReason?: string
  failureReason?: string
  retryCount: number
  lastRetriedAt?: string
  processedAt?: string
  createdAt: string
  updatedAt?: string

  bookingNumber?: string
  stationName?: string
  customerName?: string
  vehicleRegNumber?: string
  serviceName?: string
  paymentMethod?: string
}

export interface PayoutAccountStatus {
  hasLinkedAccount: boolean
  bankName?: string
  accountNumberMasked?: string
  accountHolderName?: string
}

export interface OwnerEarningsSummary {
  totalGrossRevenue: number
  totalPlatformCommission: number
  totalNetEarnings: number
  settledAmount: number
  pendingAmount: number
  processingAmount: number
  heldAmount: number
  failedAmount: number
  completedBookingsCount: number
  payoutAccountStatus: PayoutAccountStatus
}

export interface EarningsItem {
  bookingId: string
  bookingNumber: string
  stationName: string
  serviceType: string
  vehicleRegNumber: string
  customerName: string
  completedAt: string
  grossAmount: number
  platformCommission: number
  netEarnings: number
  paymentMethod: string
  settlementStatus: string
  payoutId?: string
}

export interface AdminSettlementMetrics {
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

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
