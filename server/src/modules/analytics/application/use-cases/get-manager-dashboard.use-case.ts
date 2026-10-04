import { DateRange, ManagerDashboardData } from "../../domain/types/analytics.types"
import { IAnalyticsQueryService } from "../interfaces/analytics-query.interface"
import { IGetManagerDashboardUseCase } from "../interfaces/analytics-usecases.interface"

export class GetManagerDashboardUseCase implements IGetManagerDashboardUseCase {
  constructor(private readonly queryService: IAnalyticsQueryService) {}

  async execute(
    userId: string,
    requestedStationId?: string,
    range: DateRange = "TODAY",
    year?: number,
    month?: number,
    customStartDate?: Date,
    customEndDate?: Date
  ): Promise<ManagerDashboardData> {
    const startDate = range === "CUSTOM" ? customStartDate || null : null
    const endDate = range === "CUSTOM" ? customEndDate || null : null

    return this.queryService.getManagerDashboardData(
      userId,
      requestedStationId,
      range,
      year,
      month,
      startDate,
      endDate
    )
  }
}
