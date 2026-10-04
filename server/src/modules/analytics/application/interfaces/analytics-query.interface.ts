import {
  AdminDashboardData,
  OwnerDashboardData,
  ManagerDashboardData,
  DateRange,
} from "../../domain/types/analytics.types"

export interface IAnalyticsQueryService {
  getAdminDashboardData(
    range?: DateRange,
    year?: number,
    month?: number,
    startDate?: Date | null,
    endDate?: Date | null
  ): Promise<AdminDashboardData>

  getOwnerDashboardData(
    userId: string,
    range?: DateRange,
    stationId?: string,
    year?: number,
    month?: number,
    startDate?: Date | null,
    endDate?: Date | null
  ): Promise<OwnerDashboardData>

  getManagerDashboardData(
    userId: string,
    requestedStationId?: string,
    range?: DateRange,
    year?: number,
    month?: number,
    startDate?: Date | null,
    endDate?: Date | null
  ): Promise<ManagerDashboardData>
}

export * from "./analytics-usecases.interface"
