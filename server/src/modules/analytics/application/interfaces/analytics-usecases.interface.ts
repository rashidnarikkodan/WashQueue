import {
  AdminDashboardData,
  DateRange,
  ManagerDashboardData,
  OwnerDashboardData,
} from "../../domain/types/analytics.types"

export interface IGetAdminDashboardUseCase {
  execute(range?: DateRange): Promise<AdminDashboardData>
}

export interface IGetManagerDashboardUseCase {
  execute(userId: string, requestedStationId?: string): Promise<ManagerDashboardData>
}

export interface IGetOwnerDashboardUseCase {
  execute(userId: string, range?: DateRange, stationId?: string): Promise<OwnerDashboardData>
}
