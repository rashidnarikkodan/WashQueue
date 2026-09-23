import { Model, Types } from "mongoose"
import {
  OwnerDashboardData,
  DateRange,
  TimeSeriesPoint,
  ServiceDistributionItem,
  OwnerStationSummary,
} from "../../domain/types/analytics.types"
import { IBookingDocument } from "@/modules/booking/infrastructure/models/booking.model"
import { IStation } from "@/modules/station/infrastructure/models/station.model"
import { IManagerAssignment } from "@/modules/manager/infrastructure/models/manager-assignment.model"
import { IOwner } from "@/modules/owner/infrastructure/model/owner.model"

interface AggregatedOwnerStation {
  _id: unknown
  name?: string
  status?: string
  isActive?: boolean
  rating?: number
  address?: { city?: string }
  slotConfig?: { bays?: number }
}

interface AggregatedManagerAssignment {
  stationId: unknown
  managerUserId?: { name?: string; email?: string }
}

interface AggregatedOwnerBooking {
  _id: unknown
  bookingNumber?: string
  stationDetails?: { name?: string }
  stationId?: { name?: string }
  walkInCustomer?: { name?: string }
  customerDetails?: { name?: string }
  userId?: { name?: string }
  walkInVehicle?: { registrationNumber?: string }
  vehicleDetails?: { registrationNumber?: string }
  pricingSnapshot?: { totalPrice?: number }
  status: string
  createdAt?: Date
}

export class GetOwnerDashboardUseCase {
  constructor(
    private readonly bookingModel: Model<IBookingDocument>,
    private readonly stationModel: Model<IStation>,
    private readonly ownerModel?: Model<IOwner>,
    private readonly managerAssignmentModel?: Model<IManagerAssignment>
  ) {}

  async execute(userId: string, range: DateRange = "30_DAYS"): Promise<OwnerDashboardData> {
    const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null
    const startDate = this.getStartDate(range)

    // 1. Resolve all possible owner IDs (both User._id and Owner._id)
    const ownerIds: Types.ObjectId[] = []
    if (userObjectId) {
      ownerIds.push(userObjectId)
    }

    if (this.ownerModel && userObjectId) {
      const ownerDoc = await this.ownerModel
        .findOne({ $or: [{ userId: userObjectId }, { _id: userObjectId }] })
        .lean()
      if (ownerDoc) {
        if (ownerDoc._id && !ownerIds.some((id) => id.equals(ownerDoc._id as Types.ObjectId))) {
          ownerIds.push(ownerDoc._id as Types.ObjectId)
        }
        if (
          ownerDoc.userId &&
          !ownerIds.some((id) => id.equals(ownerDoc.userId as Types.ObjectId))
        ) {
          ownerIds.push(ownerDoc.userId as Types.ObjectId)
        }
      }
    }

    // 2. Fetch Owner's Stations
    const stationsRaw: unknown = await this.stationModel.find({ ownerId: { $in: ownerIds } }).lean()
    const stations = stationsRaw as AggregatedOwnerStation[]
    const totalStations = stations.length
    const activeStations = stations.filter(
      (s) => s.status === "APPROVED" && s.isActive !== false
    ).length
    const avgRating =
      totalStations > 0
        ? Number(
            (
              stations.reduce((sum: number, s) => sum + (s.rating || 5.0), 0) / totalStations
            ).toFixed(1)
          )
        : 5.0

    const stationObjectIds = stations.map((s) => new Types.ObjectId(String(s._id)))

    // 3. Build Booking Match Filter
    const ownerBookingMatch: Record<string, unknown>[] = [{ ownerId: { $in: ownerIds } }]
    if (stationObjectIds.length > 0) {
      ownerBookingMatch.push({ stationId: { $in: stationObjectIds } })
    }

    const dateMatch: Record<string, unknown> = {
      $or: ownerBookingMatch,
    }
    if (startDate) {
      dateMatch.createdAt = { $gte: startDate }
    }

    // 4. Booking KPIs
    const [bookingStats] = await this.bookingModel.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: null,
          totalGrossRevenue: { $sum: "$pricingSnapshot.totalPrice" },
          netSettlementAmount: { $sum: "$settlement.stationSettlement" },
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
          },
        },
      },
    ])

    const totalGrossRevenue = bookingStats?.totalGrossRevenue || 0
    const netSettlementAmount = bookingStats?.netSettlementAmount || 0
    const totalBookings = bookingStats?.totalBookings || 0
    const completedBookings = bookingStats?.completedBookings || 0
    const completionRate =
      totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0

    // Managers count
    let totalManagers = 0
    let managerAssignments: AggregatedManagerAssignment[] = []
    if (this.managerAssignmentModel && ownerIds.length > 0) {
      const assignmentsRaw: unknown = await this.managerAssignmentModel
        .find({
          $or: [{ ownerId: { $in: ownerIds } }, { stationId: { $in: stationObjectIds } }],
          status: "ACTIVE",
        })
        .populate("managerUserId", "name email")
        .lean()
      managerAssignments = assignmentsRaw as AggregatedManagerAssignment[]
      totalManagers = managerAssignments.length
    }

    // 5. Revenue Trend
    const revenueTrendRaw = await this.bookingModel.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$pricingSnapshot.totalPrice" },
          bookingsCount: { $sum: 1 },
          commission: { $sum: "$settlement.platformCommission" },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const revenueTrend: TimeSeriesPoint[] = revenueTrendRaw.map((item) => ({
      date: item._id,
      revenue: item.revenue || 0,
      bookingsCount: item.bookingsCount || 0,
      commission: item.commission || 0,
    }))

    // 6. Station Comparison
    const stationCompRaw = await this.bookingModel.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: "$stationId",
          revenue: { $sum: "$pricingSnapshot.totalPrice" },
          bookingsCount: { $sum: 1 },
        },
      },
    ])

    const compMap = new Map<string, { revenue: number; bookingsCount: number }>()
    stationCompRaw.forEach((sc) => {
      compMap.set(String(sc._id), {
        revenue: sc.revenue || 0,
        bookingsCount: sc.bookingsCount || 0,
      })
    })

    const stationComparison = stations.map((s) => {
      const stats = compMap.get(String(s._id)) || { revenue: 0, bookingsCount: 0 }
      return {
        stationId: String(s._id),
        name: s.name || "Station",
        revenue: stats.revenue,
        bookingsCount: stats.bookingsCount,
        rating: s.rating || 5.0,
      }
    })

    // 7. Service Distribution Breakdown
    const serviceRaw = await this.bookingModel.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: "$serviceType",
          count: { $sum: 1 },
          revenue: { $sum: "$pricingSnapshot.totalPrice" },
        },
      },
    ])

    const serviceDistribution: ServiceDistributionItem[] = serviceRaw.map((sr) => ({
      name: sr._id === "FULL" ? "Full Wash & Detail" : "Quick Wash",
      count: sr.count,
      revenue: sr.revenue,
    }))

    // 8. Station Summaries for Owner
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const todayBookingsRaw = await this.bookingModel.aggregate([
      {
        $match: {
          $or: ownerBookingMatch,
          createdAt: { $gte: startOfToday },
        },
      },
      {
        $group: {
          _id: "$stationId",
          count: { $sum: 1 },
        },
      },
    ])

    const todayMap = new Map<string, number>()
    todayBookingsRaw.forEach((tb) => {
      todayMap.set(String(tb._id), tb.count)
    })

    const stationSummaries: OwnerStationSummary[] = stations.map((s) => {
      const sId = String(s._id)
      const comp = compMap.get(sId)
      const assignedAssignment = managerAssignments.find((ma) => String(ma.stationId) === sId)
      return {
        stationId: sId,
        name: s.name || "Wash Station",
        city: s.address?.city || undefined,
        totalBays: Math.max(1, s.slotConfig?.bays || 1),
        activeBays: Math.max(1, s.slotConfig?.bays || 1),
        todayBookings: todayMap.get(sId) || 0,
        totalRevenue: comp?.revenue || 0,
        rating: s.rating || 5.0,
        isActive: s.status === "APPROVED" && s.isActive !== false,
        assignedManagerName: assignedAssignment?.managerUserId?.name || undefined,
      }
    })

    // 9. Recent Bookings
    const recentBookingsRaw: unknown = await this.bookingModel
      .find({ $or: ownerBookingMatch })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("stationId", "name")
      .populate("userId", "name")
      .lean()

    const recentBookingsTyped = recentBookingsRaw as AggregatedOwnerBooking[]

    const recentBookings = recentBookingsTyped.map((b) => ({
      id: String(b._id),
      bookingNumber: b.bookingNumber || String(b._id).slice(0, 8),
      stationName: b.stationDetails?.name || b.stationId?.name || "Station",
      customerName:
        b.walkInCustomer?.name || b.customerDetails?.name || b.userId?.name || "Customer",
      vehiclePlate:
        b.walkInVehicle?.registrationNumber || b.vehicleDetails?.registrationNumber || "VEHICLE",
      amount: b.pricingSnapshot?.totalPrice || 0,
      status: b.status,
      createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
    }))

    return {
      kpis: {
        totalGrossRevenue,
        netSettlementAmount,
        totalBookings,
        completedBookings,
        completionRate,
        totalStations,
        activeStations,
        totalManagers,
        averageRating: avgRating,
      },
      revenueTrend,
      stationComparison,
      serviceDistribution,
      stations: stationSummaries,
      recentBookings,
    }
  }

  private getStartDate(range: DateRange): Date | null {
    const now = new Date()
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
