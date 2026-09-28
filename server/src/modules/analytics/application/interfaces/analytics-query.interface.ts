import {
  AdminDashboardData,
  OwnerDashboardData,
  ManagerDashboardData,
} from "../../domain/types/analytics.types"

export interface IAnalyticsQueryService {
  getAdminDashboardData(startDate: Date | null): Promise<AdminDashboardData>
  getOwnerDashboardData(
    userId: string,
    startDate: Date | null,
    stationId?: string
  ): Promise<OwnerDashboardData>
  getManagerDashboardData(
    userId: string,
    requestedStationId?: string
  ): Promise<ManagerDashboardData>
}
