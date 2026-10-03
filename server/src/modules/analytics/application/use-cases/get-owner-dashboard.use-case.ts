import { OwnerDashboardData, DateRange } from "../../domain/types/analytics.types"
import { IAnalyticsQueryService } from "../interfaces/analytics-query.interface"
import { IGetOwnerDashboardUseCase } from "../interfaces/analytics-usecases.interface"

export class GetOwnerDashboardUseCase implements IGetOwnerDashboardUseCase {
  constructor(private readonly queryService: IAnalyticsQueryService) {}

  async execute(
    userId: string,
    range: DateRange = "30_DAYS",
    stationId?: string,
    customStartDate?: Date,
    customEndDate?: Date
  ): Promise<OwnerDashboardData> {
    let startDate = this.getStartDate(range)
    let endDate = null

    if (range === "CUSTOM") {
      startDate = customStartDate || null
      endDate = customEndDate || null
    }

    return this.queryService.getOwnerDashboardData(userId, startDate, stationId, endDate)
  }

  private getStartDate(range: DateRange): Date | null {
    const now = new Date()
    if (range === "TODAY") {
      now.setHours(0, 0, 0, 0)
      return now
    }
    if (range === "7_DAYS") {
      now.setDate(now.getDate() - 7)
      return now
    }
    if (range === "30_DAYS") {
      now.setDate(now.getDate() - 30)
      return now
    }
    if (range === "90_DAYS") {
      now.setDate(now.getDate() - 90)
      return now
    }
    if (range === "YEAR") {
      now.setFullYear(now.getFullYear() - 1)
      return now
    }
    return null
  }
}
