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
    year?: number,
    month?: number,
    startDate?: string,
    endDate?: string
  ): Promise<AdminDashboardData> => {
    const res = await api.get<{ success: boolean; data: AdminDashboardData }>(
      API_ROUTES.ANALYTICS.ADMIN,
      {
        params: {
          range,
          ...(year ? { year } : {}),
          ...(month ? { month } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        },
      }
    )
    return res.data.data
  },

  getOwnerDashboard: async (
    range: DateRangeFilter = "30_DAYS",
    stationId?: string,
    year?: number,
    month?: number,
    startDate?: string,
    endDate?: string
  ): Promise<OwnerDashboardData> => {
    const res = await api.get<{ success: boolean; data: OwnerDashboardData }>(
      API_ROUTES.ANALYTICS.OWNER,
      {
        params: {
          range,
          ...(stationId && stationId !== "ALL" ? { stationId } : {}),
          ...(year ? { year } : {}),
          ...(month ? { month } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        },
      }
    )
    return res.data.data
  },

  getManagerDashboard: async (
    range: DateRangeFilter = "TODAY",
    stationId?: string,
    year?: number,
    month?: number,
    startDate?: string,
    endDate?: string
  ): Promise<ManagerDashboardData> => {
    const res = await api.get<{ success: boolean; data: ManagerDashboardData }>(
      API_ROUTES.ANALYTICS.MANAGER,
      {
        params: {
          range,
          ...(stationId && stationId !== "ALL" ? { stationId } : {}),
          ...(year ? { year } : {}),
          ...(month ? { month } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        },
      }
    )
    return res.data.data
  },

  exportOwnerAnalytics: async (
    range: DateRangeFilter = "30_DAYS",
    stationId?: string,
    year?: number,
    month?: number,
    startDate?: string,
    endDate?: string
  ): Promise<Blob> => {
    const res = await api.get(API_ROUTES.ANALYTICS.OWNER + "/export", {
      params: {
        range,
        ...(stationId && stationId !== "ALL" ? { stationId } : {}),
        ...(year ? { year } : {}),
        ...(month ? { month } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      },
      responseType: "blob",
    })
    return res.data
  },
}
