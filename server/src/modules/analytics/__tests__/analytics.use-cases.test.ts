import { describe, it, expect, vi, beforeEach } from "vitest"
import { GetAdminDashboardUseCase } from "../application/use-cases/get-admin-dashboard.use-case"
import { GetOwnerDashboardUseCase } from "../application/use-cases/get-owner-dashboard.use-case"
import { GetManagerDashboardUseCase } from "../application/use-cases/get-manager-dashboard.use-case"
import { Types } from "mongoose"

describe("Analytics Use Cases", () => {
  let mockBookingModel: unknown
  let mockStationModel: unknown
  let mockUserModel: unknown
  let mockOwnerModel: unknown
  let mockManagerAssignmentModel: unknown
  let mockReviewModel: unknown

  beforeEach(() => {
    mockBookingModel = {
      aggregate: vi.fn(),
      find: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            populate: vi.fn().mockReturnValue({
              populate: vi.fn().mockReturnValue({
                lean: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      }),
    }

    mockStationModel = {
      aggregate: vi
        .fn()
        .mockResolvedValue([{ totalStations: 5, activeStations: 4, pendingApprovals: 1 }]),
      find: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            _id: new Types.ObjectId(),
            name: "Downtown Wash",
            status: "APPROVED",
            isActive: true,
            totalBays: 3,
            slotConfig: { bays: 3 },
            rating: 4.8,
            address: { city: "Ernakulam" },
          },
        ]),
      }),
      findById: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          name: "Express Clean",
          totalBays: 2,
          slotConfig: { bays: 2 },
          rating: 4.9,
          reviewCount: 12,
          status: "APPROVED",
          address: { city: "Kochi", street: "MG Road" },
        }),
      }),
      findOne: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          name: "Express Clean",
          slotConfig: { bays: 2 },
        }),
      }),
    }

    mockUserModel = {
      aggregate: vi
        .fn()
        .mockResolvedValue([{ totalCustomers: 100, totalOwners: 10, totalManagers: 15 }]),
    }

    mockOwnerModel = {
      findOne: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          userId: new Types.ObjectId(),
          businessName: "Super Wash Co",
        }),
      }),
    }

    mockManagerAssignmentModel = {
      find: vi.fn().mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([]),
        }),
      }),
      findOne: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          stationId: new Types.ObjectId(),
          managerUserId: new Types.ObjectId(),
          status: "ACTIVE",
        }),
      }),
    }

    mockReviewModel = {
      countDocuments: vi.fn().mockResolvedValue(2),
      find: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    }
  })

  describe("GetAdminDashboardUseCase", () => {
    it("should aggregate admin platform KPIs, trends, and distributions", async () => {
      const bModel = mockBookingModel as {
        aggregate: ReturnType<typeof vi.fn>
        find: ReturnType<typeof vi.fn>
      }
      bModel.aggregate
        .mockResolvedValueOnce([
          {
            totalGrossVolume: 50000,
            totalPlatformCommission: 5000,
            totalBookings: 100,
            completedBookings: 90,
          },
        ]) // KPIs
        .mockResolvedValueOnce([
          { _id: "2026-09-20", revenue: 15000, bookingsCount: 30, commission: 1500 },
        ]) // Growth trend
        .mockResolvedValueOnce([
          { _id: "COMPLETED", count: 90 },
          { _id: "CANCELLED", count: 10 },
        ]) // Status distribution
        .mockResolvedValueOnce([
          {
            _id: new Types.ObjectId(),
            totalBookings: 50,
            totalRevenue: 25000,
            station: { name: "Downtown Wash", rating: 4.8 },
          },
        ]) // Top stations

      const useCase = new GetAdminDashboardUseCase(
        mockBookingModel as never,
        mockStationModel as never,
        mockUserModel as never,
        mockReviewModel as never
      )

      const result = await useCase.execute("30_DAYS")

      expect(result.kpis.totalGrossVolume).toBe(50000)
      expect(result.kpis.totalPlatformCommission).toBe(5000)
      expect(result.kpis.totalBookings).toBe(100)
      expect(result.kpis.completionRate).toBe(90)
      expect(result.kpis.totalCustomers).toBe(100)
      expect(result.growthTrend).toHaveLength(1)
      expect(result.bookingStatusDistribution).toHaveLength(2)
      expect(result.topStations).toHaveLength(1)
    })
  })

  describe("GetOwnerDashboardUseCase", () => {
    it("should aggregate multi-station statistics for an owner", async () => {
      const ownerId = new Types.ObjectId().toString()
      const bModel = mockBookingModel as {
        aggregate: ReturnType<typeof vi.fn>
        find: ReturnType<typeof vi.fn>
      }

      bModel.aggregate
        .mockResolvedValueOnce([
          {
            totalGrossRevenue: 30000,
            netSettlementAmount: 27000,
            totalBookings: 60,
            completedBookings: 55,
          },
        ]) // KPIs
        .mockResolvedValueOnce([
          { _id: "2026-09-21", revenue: 10000, bookingsCount: 20, commission: 1000 },
        ]) // Revenue trend
        .mockResolvedValueOnce([{ _id: new Types.ObjectId(), revenue: 30000, bookingsCount: 60 }]) // Station comparison
        .mockResolvedValueOnce([
          { _id: "FULL", count: 40, revenue: 20000 },
          { _id: "HALF", count: 20, revenue: 10000 },
        ]) // Service distribution
        .mockResolvedValueOnce([]) // Today's bookings

      const useCase = new GetOwnerDashboardUseCase(
        mockBookingModel as never,
        mockStationModel as never,
        mockOwnerModel as never,
        mockManagerAssignmentModel as never
      )

      const result = await useCase.execute(ownerId, "30_DAYS")

      expect(result.kpis.totalGrossRevenue).toBe(30000)
      expect(result.kpis.netSettlementAmount).toBe(27000)
      expect(result.kpis.totalStations).toBe(1)
      expect(result.kpis.activeStations).toBe(1)
      expect(result.revenueTrend).toHaveLength(1)
      expect(result.serviceDistribution).toHaveLength(2)
      expect(result.stations).toHaveLength(1)
    })
  })

  describe("GetManagerDashboardUseCase", () => {
    it("should aggregate single-station live operations data", async () => {
      const managerId = new Types.ObjectId().toString()
      const stationId = new Types.ObjectId().toString()
      const bModel = mockBookingModel as {
        aggregate: ReturnType<typeof vi.fn>
        find: ReturnType<typeof vi.fn>
      }

      bModel.find.mockReturnValueOnce({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              _id: new Types.ObjectId(),
              bookingNumber: "WQ-1001",
              status: "IN_SERVICE",
              serviceType: "FULL",
              serviceStartedAt: new Date(Date.now() - 10 * 60000),
              walkInVehicle: { registrationNumber: "KL-07-AB-1234" },
              pricingSnapshot: { totalPrice: 499 },
            },
          ]),
        }),
      })

      bModel.aggregate.mockResolvedValueOnce([
        { _id: "2026-09-22", revenue: 2500, bookingsCount: 5 },
      ])

      const useCase = new GetManagerDashboardUseCase(
        mockBookingModel as never,
        mockStationModel as never,
        mockManagerAssignmentModel as never,
        mockReviewModel as never
      )

      const result = await useCase.execute(managerId, stationId)

      expect(result.station.name).toBe("Express Clean")
      expect(result.kpis.todayInService).toBe(1)
      expect(result.bayStates).toHaveLength(2)
      expect(result.bayStates[0]?.isOccupied).toBe(true)
      expect(result.bayStates[0]?.vehiclePlate).toBe("KL-07-AB-1234")
      expect(result.bayStates[1]?.isOccupied).toBe(false)
    })
  })
})
