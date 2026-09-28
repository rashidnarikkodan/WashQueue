import { ManagerDashboardData } from "../../domain/types/analytics.types"
import { IAnalyticsQueryService } from "../interfaces/analytics-query.interface"

export class GetManagerDashboardUseCase {
  constructor(private readonly queryService: IAnalyticsQueryService) {}

  async execute(userId: string, requestedStationId?: string): Promise<ManagerDashboardData> {
    return this.queryService.getManagerDashboardData(userId, requestedStationId)
  }
}
