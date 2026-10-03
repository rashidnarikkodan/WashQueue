import {
  AdminDashboardData,
  OwnerDashboardData,
  ManagerDashboardData,
} from "../../domain/types/analytics.types"

export interface IAnalyticsQueryService {
  getAdminDashboardData(startDate: Date | null, endDate?: Date | null): Promise<AdminDashboardData>
  getOwnerDashboardData(
    userId: string,
    startDate: Date | null,
    stationId?: string,
    endDate?: Date | null
  ): Promise<OwnerDashboardData>
  getManagerDashboardData(
    userId: string,
    requestedStationId?: string,
    startDate?: Date | null,
    endDate?: Date | null
  ): Promise<ManagerDashboardData>
}

export * from "./analytics-usecases.interface"
