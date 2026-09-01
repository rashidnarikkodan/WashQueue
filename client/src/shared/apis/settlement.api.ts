import { api } from "../config/axios"
import { API_ROUTES } from "../constants/api.const"

export type SettlementStatus = "PENDING" | "PROCESSING" | "SETTLED" | "HELD" | "FAILED"

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
  transferId?: string
  holdReason?: string
  failureReason?: string
  retryCount: number
  lastRetriedAt?: string
  settledAt?: string
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
  transferId?: string
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
  transferId?: string
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

export const settlementApi = {
  // Provider: Earnings Summary
  getOwnerSummary: async (params?: {
    startDate?: string
    endDate?: string
  }): Promise<OwnerEarningsSummary> => {
    const response = await api.get(API_ROUTES.SETTLEMENTS.OWNER_SUMMARY, {
      params,
      skipToast: true,
    })
    return response.data.data
  },

  // Provider: Settlement History
  getOwnerSettlements: async (params?: {
    status?: string
    stationId?: string
    startDate?: string
    endDate?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResult<Settlement>> => {
    const response = await api.get(API_ROUTES.SETTLEMENTS.OWNER_SETTLEMENTS, {
      params,
      skipToast: true,
    })
    return response.data.data
  },

  // Provider: Completed Bookings Earnings History
  getOwnerEarnings: async (params?: {
    page?: number
    limit?: number
  }): Promise<PaginatedResult<EarningsItem>> => {
    const response = await api.get(API_ROUTES.SETTLEMENTS.OWNER_EARNINGS, {
      params,
      skipToast: true,
    })
    return response.data.data
  },

  // Provider: Settlement Details
  getOwnerSettlementById: async (id: string): Promise<Settlement> => {
    const response = await api.get(API_ROUTES.SETTLEMENTS.OWNER_BY_ID(id), {
      skipToast: true,
    })
    return response.data.data
  },

  // Admin: Settlements List
  getAdminSettlements: async (params?: {
    status?: string
    ownerId?: string
    stationId?: string
    startDate?: string
    endDate?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResult<Settlement>> => {
    const response = await api.get(API_ROUTES.SETTLEMENTS.ADMIN_LIST, {
      params,
      skipToast: true,
    })
    return response.data.data
  },

  // Admin: Financial Metrics
  getAdminMetrics: async (params?: {
    startDate?: string
    endDate?: string
  }): Promise<AdminSettlementMetrics> => {
    const response = await api.get(API_ROUTES.SETTLEMENTS.ADMIN_METRICS, {
      params,
      skipToast: true,
    })
    return response.data.data
  },

  // Admin: Settlement Detail
  getAdminSettlementById: async (id: string): Promise<Settlement> => {
    const response = await api.get(API_ROUTES.SETTLEMENTS.ADMIN_BY_ID(id), {
      skipToast: true,
    })
    return response.data.data
  },

  // Admin: Retry Settlement
  retrySettlement: async (id: string): Promise<Settlement> => {
    const response = await api.post(
      API_ROUTES.SETTLEMENTS.ADMIN_RETRY(id),
      {},
      { successToast: "Settlement payout retry initiated" }
    )
    return response.data.data
  },

  // Admin: Hold Settlement
  holdSettlement: async (id: string, reason?: string): Promise<Settlement> => {
    const response = await api.post(
      API_ROUTES.SETTLEMENTS.ADMIN_HOLD(id),
      { reason },
      { successToast: "Settlement marked as HELD" }
    )
    return response.data.data
  },

  // Admin: Release Settlement
  releaseSettlement: async (id: string): Promise<Settlement> => {
    const response = await api.post(
      API_ROUTES.SETTLEMENTS.ADMIN_RELEASE(id),
      {},
      { successToast: "Settlement hold released for processing" }
    )
    return response.data.data
  },
}
