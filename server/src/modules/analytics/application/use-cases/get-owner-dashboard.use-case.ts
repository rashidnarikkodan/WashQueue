import { OwnerDashboardData, DateRange } from "../../domain/types/analytics.types"
import { IAnalyticsQueryService } from "../interfaces/analytics-query.interface"
import { IGetOwnerDashboardUseCase } from "../interfaces/analytics-usecases.interface"

export class GetOwnerDashboardUseCase implements IGetOwnerDashboardUseCase {
  constructor(private readonly queryService: IAnalyticsQueryService) {}

  async execute(
    userId: string,
    range: DateRange = "30_DAYS",
    stationId?: string,
    year?: number,
    month?: number,
    customStartDate?: Date,
    customEndDate?: Date
  ): Promise<OwnerDashboardData> {
    const startDate = range === "CUSTOM" ? customStartDate || null : null
    const endDate = range === "CUSTOM" ? customEndDate || null : null

    return this.queryService.getOwnerDashboardData(
      userId,
      range,
      stationId,
      year,
      month,
      startDate,
      endDate
    )
  }
}
