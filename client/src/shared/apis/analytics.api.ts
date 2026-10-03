import type {
  DateRangeFilter,
  AdminDashboardData,
  OwnerDashboardData,
  ManagerDashboardData,
} from "../types/analytics.types"
export * from "../types/analytics.types"
import { api } from "../config/axios"
import { API_ROUTES } from "../constants/api.const"

export const analyticsApi = {
  getAdminDashboard: async (
    range: DateRangeFilter = "30_DAYS",
    startDate?: string,
    endDate?: string
  ): Promise<AdminDashboardData> => {
    const res = await api.get<{ success: boolean; data: AdminDashboardData }>(
      API_ROUTES.ANALYTICS.ADMIN,
      { params: { range, ...(startDate ? { startDate } : {}), ...(endDate ? { endDate } : {}) } }
    )
    return res.data.data
  },

  getOwnerDashboard: async (
    range: DateRangeFilter = "30_DAYS",
    stationId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<OwnerDashboardData> => {
    const res = await api.get<{ success: boolean; data: OwnerDashboardData }>(
      API_ROUTES.ANALYTICS.OWNER,
      {
        params: {
          range,
          ...(stationId && stationId !== "ALL" ? { stationId } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        },
      }
    )
    return res.data.data
  },

  getManagerDashboard: async (
    stationId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<ManagerDashboardData> => {
    const res = await api.get<{ success: boolean; data: ManagerDashboardData }>(
      API_ROUTES.ANALYTICS.MANAGER,
      {
        params: { stationId, ...(startDate ? { startDate } : {}), ...(endDate ? { endDate } : {}) },
      }
    )
    return res.data.data
  },

  exportOwnerAnalytics: async (
    range: DateRangeFilter = "30_DAYS",
    stationId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<Blob> => {
    const res = await api.get(API_ROUTES.ANALYTICS.OWNER + "/export", {
      params: {
        range,
        ...(stationId && stationId !== "ALL" ? { stationId } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      },
      responseType: "blob",
    })
    return res.data
  },
}
