import { api } from "@/shared/config/axios"
import { API_ROUTES } from "@/shared/constants/api.const"
import { handleApiError } from "@/shared/utils/handleApiError"
import type {
  FraudEventDto,
  FraudQueryParams,
  FraudMetricsDto,
  WatchlistUser,
  SecurityAuditLog,
} from "@/features/fraud/types/fraud.types"

export const fraudApi = {
  getMetrics: async (params?: {
    startDate?: string
    endDate?: string
  }): Promise<FraudMetricsDto> => {
    try {
      const response = await api.get(API_ROUTES.FRAUD.METRICS, { params, skipToast: true })
      return (
        response.data?.data || {
          totalAlerts: 0,
          highRiskCount: 0,
          mediumRiskCount: 0,
          lowRiskCount: 0,
          openAlertsCount: 0,
          highRiskUsersCount: 0,
          suspendedAccountsCount: 0,
          failedLoginsCount: 0,
          criticalThreatsCount: 0,
          alertsTrend: "+0%",
          highRiskTrend: "0%",
          loginsTrend: "0%",
        }
      )
    } catch (error) {
      throw handleApiError(error, "Failed to load fraud metrics")
    }
  },

  listEvents: async (
    params: FraudQueryParams = {}
  ): Promise<{ items: FraudEventDto[]; total: number }> => {
    try {
      const cleanParams: Record<string, unknown> = {}
      if (params.status && params.status !== "ALL") cleanParams.status = params.status
      if (params.riskLevel && params.riskLevel !== "ALL") cleanParams.riskLevel = params.riskLevel
      if (params.actorType) cleanParams.actorType = params.actorType
      if (params.entityType) cleanParams.entityType = params.entityType
      if (params.stationId) cleanParams.stationId = params.stationId
      if (params.userId) cleanParams.userId = params.userId
      if (params.startDate) cleanParams.startDate = params.startDate
      if (params.endDate) cleanParams.endDate = params.endDate
      if (params.search) cleanParams.search = params.search
      if (params.page) cleanParams.page = params.page
      if (params.limit) cleanParams.limit = params.limit

      const response = await api.get(API_ROUTES.FRAUD.EVENTS, {
        params: cleanParams,
        skipToast: true,
      })

      return (
        response.data?.data || {
          items: [],
          total: 0,
        }
      )
    } catch (error) {
      throw handleApiError(error, "Failed to load fraud events")
    }
  },

  getEventById: async (id: string): Promise<FraudEventDto> => {
    try {
      const response = await api.get(API_ROUTES.FRAUD.EVENT_BY_ID(id))
      return response.data?.data
    } catch (error) {
      throw handleApiError(error, "Failed to load fraud event details")
    }
  },

  updateEventStatus: async (
    id: string,
    action: "REVIEW" | "RESOLVE" | "DISMISS",
    notes?: string
  ): Promise<void> => {
    try {
      await api.patch(API_ROUTES.FRAUD.UPDATE_STATUS(id), { action, notes })
    } catch (error) {
      throw handleApiError(error, "Failed to update fraud event status")
    }
  },

  getUserProfile: async (
    userId: string
  ): Promise<{
    summary: {
      userId: string
      totalEvents: number
      highRiskCount: number
      mediumRiskCount: number
      openEventsCount: number
      lastEventDate?: string | null
      highestRiskScore: number
    }
    recentEvents: FraudEventDto[]
  }> => {
    try {
      const response = await api.get(API_ROUTES.FRAUD.USER_PROFILE(userId))
      return response.data?.data
    } catch (error) {
      throw handleApiError(error, "Failed to load user fraud profile")
    }
  },

  getWatchlist: async (): Promise<WatchlistUser[]> => {
    try {
      const response = await api.get(API_ROUTES.FRAUD.WATCHLIST, { skipToast: true })
      return response.data?.data || []
    } catch (error) {
      throw handleApiError(error, "Failed to load fraud watchlist")
    }
  },

  getSecurityLogs: async (): Promise<SecurityAuditLog[]> => {
    try {
      const response = await api.get(API_ROUTES.FRAUD.SECURITY_LOGS, { skipToast: true })
      return response.data?.data || []
    } catch (error) {
      throw handleApiError(error, "Failed to load security logs")
    }
  },
}
