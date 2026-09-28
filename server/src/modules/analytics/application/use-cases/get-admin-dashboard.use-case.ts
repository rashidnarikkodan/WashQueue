import { AdminDashboardData, DateRange } from "../../domain/types/analytics.types"
import { IAnalyticsQueryService } from "../interfaces/analytics-query.interface"

export class GetAdminDashboardUseCase {
  constructor(private readonly queryService: IAnalyticsQueryService) {}

  async execute(range: DateRange = "30_DAYS"): Promise<AdminDashboardData> {
    const startDate = this.getStartDate(range)
    return this.queryService.getAdminDashboardData(startDate)
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
