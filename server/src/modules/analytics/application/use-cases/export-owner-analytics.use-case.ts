import { DateRange } from "../../domain/types/analytics.types"
import { IAnalyticsQueryService } from "../interfaces/analytics-query.interface"
import { IExportService } from "@/core/application/interfaces/export-service.interface"

export interface IExportOwnerAnalyticsUseCase {
  execute(userId: string, range?: DateRange, stationId?: string, startDate?: Date, endDate?: Date): Promise<{ buffer: Buffer, contentType: string, extension: string, filename: string }>
}

export class ExportOwnerAnalyticsUseCase implements IExportOwnerAnalyticsUseCase {
  constructor(
    private readonly queryService: IAnalyticsQueryService,
    private readonly exportService: IExportService
  ) {}

  async execute(userId: string, range: DateRange = "30_DAYS", stationId?: string, customStartDate?: Date, customEndDate?: Date) {
    let startDate = this.getStartDate(range)
    let endDate = null

    if (range === "CUSTOM") {
      startDate = customStartDate || null
      endDate = customEndDate || null
    }

    const dashboardData = await this.queryService.getOwnerDashboardData(userId, startDate, stationId, endDate)
    
    if (!dashboardData.stations || !dashboardData.stations.length) {
      throw new Error("No stations found for owner")
    }

    const stationsData = dashboardData.stations.map(stationDoc => {
      const comp = dashboardData.stationComparison.find(sc => sc.stationId === stationDoc.stationId)
      return {
        ...stationDoc,
        todayBookings: comp?.bookingsCount || 0,
      }
    })

    const buffer = await this.exportService.export<typeof stationsData[0]>({
      filename: `owner_analytics_${range.toLowerCase()}`,
      columns: [
        { header: "Station Name", accessor: (row: typeof stationsData[0]) => row.name },
        { header: "City", accessor: (row: typeof stationsData[0]) => row.city },
        { header: "Configured Bays", accessor: (row: typeof stationsData[0]) => row.totalBays },
        { header: "Completed Washes", accessor: (row: typeof stationsData[0]) => row.todayBookings },
        { header: "Gross Revenue (INR)", accessor: (row: typeof stationsData[0]) => row.totalRevenue },
        { header: "Platform Fee 15% (INR)", accessor: (row: typeof stationsData[0]) => Math.round(row.totalRevenue * 0.15) },
        { header: "Net Payout 85% (INR)", accessor: (row: typeof stationsData[0]) => row.totalRevenue - Math.round(row.totalRevenue * 0.15) },
        { header: "Revenue Per Bay (INR)", accessor: (row: typeof stationsData[0]) => row.totalBays > 0 ? Math.round(row.totalRevenue / row.totalBays) : 0 },
        { header: "Customer Rating", accessor: (row: typeof stationsData[0]) => row.rating },
        { header: "Payout Status", accessor: () => "Settled" },
      ],
      data: stationsData,
    })

    return {
      buffer,
      contentType: this.exportService.getContentType(),
      extension: this.exportService.getFileExtension(),
      filename: `owner-financial-statement-${range.toLowerCase()}-${Date.now()}`
    }
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
