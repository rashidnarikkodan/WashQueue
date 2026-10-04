import { describe, it, expect, vi, beforeEach } from "vitest"
import { GetAdminDashboardUseCase } from "../application/use-cases/get-admin-dashboard.use-case"
import { GetOwnerDashboardUseCase } from "../application/use-cases/get-owner-dashboard.use-case"
import { GetManagerDashboardUseCase } from "../application/use-cases/get-manager-dashboard.use-case"
import { IAnalyticsQueryService } from "../application/interfaces/analytics-query.interface"

describe("Analytics Use Cases", () => {
  let mockQueryService: IAnalyticsQueryService

  beforeEach(() => {
    mockQueryService = {
      getAdminDashboardData: vi.fn(),
      getOwnerDashboardData: vi.fn(),
      getManagerDashboardData: vi.fn(),
    }
  })

  describe("GetAdminDashboardUseCase", () => {
    it("should fetch admin platform KPIs via query service", async () => {
      const mockResult = {
        kpis: {
          totalGrossVolume: 50000,
          totalPlatformCommission: 5000,
          totalBookings: 100,
          completedBookings: 90,
          completionRate: 90,
          totalCustomers: 100,
          totalOwners: 10,
          totalManagers: 15,
          totalStations: 5,
          activeStations: 4,
          pendingApprovals: 1,
          openDisputes: 2,
        },
        growthTrend: [{ date: "2026-09-20", revenue: 15000, bookingsCount: 30, commission: 1500 }],
        bookingStatusDistribution: [{ status: "COMPLETED", count: 90, percentage: 90 }],
        topStations: [
          {
            stationId: "station-1",
            name: "Downtown Wash",
            totalBookings: 50,
            totalRevenue: 25000,
            rating: 4.8,
          },
        ],
        recentBookings: [],
      }

      ;(mockQueryService.getAdminDashboardData as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResult
      )

      const useCase = new GetAdminDashboardUseCase(mockQueryService)

      const result = await useCase.execute("30_DAYS")

      expect(result).toEqual(mockResult)
      expect(mockQueryService.getAdminDashboardData).toHaveBeenCalled()
    })
  })

  describe("GetOwnerDashboardUseCase", () => {
    it("should fetch multi-station statistics for an owner via query service", async () => {
      const ownerId = "owner-1"
      const mockResult = {
        kpis: {
          totalGrossRevenue: 30000,
          netSettlementAmount: 27000,
          totalBookings: 60,
          completedBookings: 55,
          completionRate: 91,
          totalStations: 1,
          activeStations: 1,
          totalManagers: 1,
          averageRating: 4.5,
        },
        revenueTrend: [{ date: "2026-09-21", revenue: 10000, bookingsCount: 20, commission: 1000 }],
        stationComparison: [
          {
            stationId: "station-1",
            name: "Wash Station",
            revenue: 30000,
            bookingsCount: 60,
            rating: 4.5,
          },
        ],
        serviceDistribution: [{ name: "Full Wash", count: 40, revenue: 20000 }],
        stations: [
          {
            stationId: "station-1",
            name: "Wash Station",
            totalBays: 2,
            activeBays: 2,
            todayBookings: 5,
            totalRevenue: 30000,
            rating: 4.5,
            isActive: true,
          },
        ],
        recentBookings: [],
      }

      ;(mockQueryService.getOwnerDashboardData as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResult
      )

      const useCase = new GetOwnerDashboardUseCase(mockQueryService)

      const result = await useCase.execute(ownerId, "30_DAYS")

      expect(result).toEqual(mockResult)
      expect(mockQueryService.getOwnerDashboardData).toHaveBeenCalled()
    })
  })

  describe("GetManagerDashboardUseCase", () => {
    it("should fetch single-station live operations data via query service", async () => {
      const managerId = "manager-1"
      const stationId = "station-1"
      const mockResult = {
        station: {
          id: stationId,
          name: "Express Clean",
          totalBays: 2,
          rating: 4.9,
          totalReviews: 12,
          status: "APPROVED",
        },
        kpis: {
          todayTotalScheduled: 10,
          todayCheckedIn: 2,
          todayInService: 1,
          todayCompleted: 5,
          todayNoShow: 0,
          todayRevenue: 2500,
          bayOccupancyRate: 50,
          averageServiceMinutes: 25,
        },
        bayStates: [
          {
            bayNumber: 1,
            isOccupied: true,
            currentBookingNumber: "WQ-1001",
            vehiclePlate: "KL-07",
            serviceType: "Full Wash",
            status: "IN_SERVICE",
            timeRemainingMinutes: 10,
          },
          { bayNumber: 2, isOccupied: false, status: "AVAILABLE" },
        ],
        hourlyTrafficToday: [],
        weeklyVolume: [],
        upcomingQueue: [],
        activeIssues: [],
      }

      ;(mockQueryService.getManagerDashboardData as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResult
      )

      const useCase = new GetManagerDashboardUseCase(mockQueryService)

      const result = await useCase.execute(managerId, stationId)

      expect(result).toEqual(mockResult)
      expect(mockQueryService.getManagerDashboardData).toHaveBeenCalledWith(
        managerId,
        stationId,
        "TODAY",
        undefined,
        undefined,
        null,
        null
      )
    })
  })
})
