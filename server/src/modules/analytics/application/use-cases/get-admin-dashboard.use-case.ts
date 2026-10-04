import { AdminDashboardData, DateRange } from "../../domain/types/analytics.types"
import { IAnalyticsQueryService } from "../interfaces/analytics-query.interface"
import { IGetAdminDashboardUseCase } from "../interfaces/analytics-usecases.interface"

export class GetAdminDashboardUseCase implements IGetAdminDashboardUseCase {
  constructor(private readonly queryService: IAnalyticsQueryService) {}

  async execute(
    range: DateRange = "30_DAYS",
    year?: number,
    month?: number,
    customStartDate?: Date,
    customEndDate?: Date
  ): Promise<AdminDashboardData> {
    const startDate = range === "CUSTOM" ? customStartDate || null : null
    const endDate = range === "CUSTOM" ? customEndDate || null : null

    return this.queryService.getAdminDashboardData(range, year, month, startDate, endDate)
  }
}
