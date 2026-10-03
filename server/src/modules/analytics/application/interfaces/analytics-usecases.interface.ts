import {
  AdminDashboardData,
  DateRange,
  ManagerDashboardData,
  OwnerDashboardData,
} from "../../domain/types/analytics.types"

export interface IGetAdminDashboardUseCase {
  execute(range?: DateRange, startDate?: Date, endDate?: Date): Promise<AdminDashboardData>
}

export interface IGetManagerDashboardUseCase {
  execute(
    userId: string,
    requestedStationId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ManagerDashboardData>
}

export interface IGetOwnerDashboardUseCase {
  execute(
    userId: string,
    range?: DateRange,
    stationId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<OwnerDashboardData>
}
