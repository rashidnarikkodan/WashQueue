import { Model } from "mongoose"
import {
  AdminDashboardData,
  DateRange,
  TimeSeriesPoint,
  StatusDistributionItem,
  StationLeaderboardItem,
} from "../../domain/types/analytics.types"
import { IBookingDocument } from "@/modules/booking/infrastructure/models/booking.model"
import { IStation } from "@/modules/station/infrastructure/models/station.model"
import { IUser } from "@/modules/user/infrastructure/model/user.model"
import { IReview } from "@/modules/review/infrastructure/models/review.model"

interface AggregatedBookingRecord {
  _id: unknown
  bookingNumber?: string
  stationDetails?: { name?: string }
  stationId?: { name?: string }
  walkInCustomer?: { name?: string }
  customerDetails?: { name?: string }
  userId?: { name?: string }
  pricingSnapshot?: { totalPrice?: number }
  status: string
  serviceType?: string
  createdAt?: Date
}

export class GetAdminDashboardUseCase {
  constructor(
    private readonly bookingModel: Model<IBookingDocument>,
    private readonly stationModel: Model<IStation>,
    private readonly userModel: Model<IUser>,
    private readonly reviewModel?: Model<IReview>
  ) {}

  async execute(range: DateRange = "30_DAYS"): Promise<AdminDashboardData> {
    const startDate = this.getStartDate(range)
    const dateQuery = startDate ? { createdAt: { $gte: startDate } } : {}

    // 1. KPIs
    const [bookingStats] = await this.bookingModel.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: null,
          totalGrossVolume: { $sum: "$pricingSnapshot.totalPrice" },
          totalPlatformCommission: { $sum: "$settlement.platformCommission" },
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
          },
        },
      },
    ])

    const totalGrossVolume = bookingStats?.totalGrossVolume || 0
    const totalPlatformCommission = bookingStats?.totalPlatformCommission || 0
    const totalBookings = bookingStats?.totalBookings || 0
    const completedBookings = bookingStats?.completedBookings || 0
    const completionRate =
      totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0

    // User counts
    const [userCounts] = await this.userModel.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: {
            $sum: { $cond: [{ $eq: ["$role", "CUSTOMER"] }, 1, 0] },
          },
          totalOwners: {
            $sum: { $cond: [{ $eq: ["$role", "OWNER"] }, 1, 0] },
          },
          totalManagers: {
            $sum: { $cond: [{ $eq: ["$role", "MANAGER"] }, 1, 0] },
          },
        },
      },
    ])

    // Station counts
    const [stationCounts] = await this.stationModel.aggregate([
      {
        $group: {
          _id: null,
          totalStations: { $sum: 1 },
          activeStations: {
            $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] },
          },
          pendingApprovals: {
            $sum: { $cond: [{ $eq: ["$status", "PENDING_APPROVAL"] }, 1, 0] },
          },
        },
      },
    ])

    // Flagged reviews / disputes count
    let openDisputes = 0
    if (this.reviewModel) {
      openDisputes = await this.reviewModel.countDocuments({
        report_count: { $gt: 0 },
      })
    }

    // 2. Growth Trend (daily or monthly buckets)
    const growthTrendRaw = await this.bookingModel.aggregate([
      { $match: dateQuery },
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

    const growthTrend: TimeSeriesPoint[] = growthTrendRaw.map((item) => ({
      date: item._id,
      revenue: item.revenue || 0,
      bookingsCount: item.bookingsCount || 0,
      commission: item.commission || 0,
    }))

    // 3. Status Distribution
    const statusRaw = await this.bookingModel.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const bookingStatusDistribution: StatusDistributionItem[] = statusRaw.map((s) => ({
      status: s._id || "UNKNOWN",
      count: s.count,
      percentage: totalBookings > 0 ? Math.round((s.count / totalBookings) * 100) : 0,
    }))

    // 4. Top Stations by Revenue
    const topStationsRaw = await this.bookingModel.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: "$stationId",
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$pricingSnapshot.totalPrice" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "stations",
          localField: "_id",
          foreignField: "_id",
          as: "station",
        },
      },
      { $unwind: { path: "$station", preserveNullAndEmptyArrays: true } },
    ])

    const topStations: StationLeaderboardItem[] = topStationsRaw.map((t) => ({
      stationId: String(t._id),
      name: t.station?.name || "Station",
      city: t.station?.address?.city || undefined,
      totalBookings: t.totalBookings || 0,
      totalRevenue: t.totalRevenue || 0,
      rating: t.station?.rating || 5.0,
    }))

    // 5. Recent Bookings
    const recentBookingsRaw: unknown = await this.bookingModel
      .find({})
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("stationId", "name")
      .populate("userId", "name")
      .lean()

    const recentBookingsTyped = recentBookingsRaw as AggregatedBookingRecord[]

    const recentBookings = recentBookingsTyped.map((b) => ({
      id: String(b._id),
      bookingNumber: b.bookingNumber || String(b._id).slice(0, 8),
      stationName: b.stationDetails?.name || b.stationId?.name || "Station",
      customerName:
        b.walkInCustomer?.name || b.customerDetails?.name || b.userId?.name || "Guest Customer",
      amount: b.pricingSnapshot?.totalPrice || 0,
      status: b.status,
      serviceType: b.serviceType || "FULL",
      createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
    }))

    return {
      kpis: {
        totalGrossVolume,
        totalPlatformCommission,
        totalBookings,
        completedBookings,
        completionRate,
        totalCustomers: userCounts?.totalCustomers || 0,
        totalOwners: userCounts?.totalOwners || 0,
        totalManagers: userCounts?.totalManagers || 0,
        totalStations: stationCounts?.totalStations || 0,
        activeStations: stationCounts?.activeStations || 0,
        pendingApprovals: stationCounts?.pendingApprovals || 0,
        openDisputes,
      },
      growthTrend,
      bookingStatusDistribution,
      topStations,
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
