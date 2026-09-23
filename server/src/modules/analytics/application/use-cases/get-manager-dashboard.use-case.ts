import { Model, Types } from "mongoose"
import {
  ManagerDashboardData,
  LiveBayState,
  HourlyTrafficPoint,
  TimeSeriesPoint,
} from "../../domain/types/analytics.types"
import { IBookingDocument } from "@/modules/booking/infrastructure/models/booking.model"
import { IStation } from "@/modules/station/infrastructure/models/station.model"
import { IManagerAssignment } from "@/modules/manager/infrastructure/models/manager-assignment.model"
import { IReview } from "@/modules/review/infrastructure/models/review.model"

interface AggregatedStationData {
  _id: unknown
  name?: string
  rating?: number
  reviewCount?: number
  status?: string
  address?: { street?: string; city?: string }
  slotConfig?: { bays?: number }
}

interface AggregatedManagerBooking {
  _id: unknown
  bookingNumber?: string
  status: string
  serviceType?: string
  serviceStartedAt?: Date
  completedAt?: Date
  createdAt: Date
  pricingSnapshot?: { totalPrice?: number }
  scheduling?: { windowStart?: Date; windowEnd?: Date }
  walkInCustomer?: { name?: string; phone?: string }
  customerDetails?: { name?: string; phone?: string }
  walkInVehicle?: { registrationNumber?: string }
  vehicleDetails?: { registrationNumber?: string }
  isWalkIn?: boolean
}

interface AggregatedFlaggedReview {
  _id: unknown
  comment?: string
  report_count?: number
  createdAt?: Date
}

export class GetManagerDashboardUseCase {
  constructor(
    private readonly bookingModel: Model<IBookingDocument>,
    private readonly stationModel: Model<IStation>,
    private readonly managerAssignmentModel?: Model<IManagerAssignment>,
    private readonly reviewModel?: Model<IReview>
  ) {}

  async execute(userId: string, requestedStationId?: string): Promise<ManagerDashboardData> {
    let resolvedStationId = requestedStationId

    // If no explicit stationId provided, resolve through manager assignment
    if (!resolvedStationId && this.managerAssignmentModel) {
      const assignment = await this.managerAssignmentModel
        .findOne({ managerUserId: new Types.ObjectId(userId), status: "ACTIVE" })
        .lean()
      if (assignment) {
        resolvedStationId = String(assignment.stationId)
      }
    }

    if (!resolvedStationId) {
      // Fallback: Check if user owns a station
      const station = await this.stationModel
        .findOne({ ownerId: new Types.ObjectId(userId) })
        .lean()
      if (station) {
        resolvedStationId = String(station._id)
      }
    }

    if (!resolvedStationId) {
      throw new Error("No station assigned or found for this user")
    }

    const stationObjectId = new Types.ObjectId(resolvedStationId)
    const stationRaw: unknown = await this.stationModel.findById(stationObjectId).lean()
    if (!stationRaw) {
      throw new Error("Station not found")
    }

    const station = stationRaw as AggregatedStationData
    const totalBays = Math.max(1, station.slotConfig?.bays || 1)

    // Today's range
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999)

    // 1. Today's Bookings
    const todayBookingsRaw: unknown = await this.bookingModel
      .find({
        stationId: stationObjectId,
        $or: [
          { "scheduling.windowStart": { $gte: startOfToday, $lte: endOfToday } },
          { createdAt: { $gte: startOfToday, $lte: endOfToday } },
        ],
      })
      .sort({ "scheduling.windowStart": 1, createdAt: 1 })
      .lean()

    const todayBookings = todayBookingsRaw as AggregatedManagerBooking[]

    let todayCheckedIn = 0
    let todayInService = 0
    let todayCompleted = 0
    let todayNoShow = 0
    let todayRevenue = 0
    let totalServiceDurationMinutes = 0
    let durationCount = 0

    todayBookings.forEach((b) => {
      if (b.status === "CHECKED_IN") todayCheckedIn++
      else if (b.status === "IN_SERVICE") todayInService++
      else if (b.status === "COMPLETED") {
        todayCompleted++
        todayRevenue += b.pricingSnapshot?.totalPrice || 0
        if (b.serviceStartedAt && b.completedAt) {
          const start = new Date(b.serviceStartedAt).getTime()
          const end = new Date(b.completedAt).getTime()
          const mins = Math.max(1, Math.round((end - start) / 60000))
          totalServiceDurationMinutes += mins
          durationCount++
        }
      } else if (b.status === "NO_SHOW") todayNoShow++
    })

    const averageServiceMinutes =
      durationCount > 0 ? Math.round(totalServiceDurationMinutes / durationCount) : 25
    const bayOccupancyRate =
      totalBays > 0 ? Math.min(100, Math.round((todayInService / totalBays) * 100)) : 0

    // 2. Live Bay States
    const activeInService = todayBookings.filter((b) => b.status === "IN_SERVICE")
    const bayStates: LiveBayState[] = []
    for (let i = 1; i <= totalBays; i++) {
      const activeBooking = activeInService[i - 1]
      if (activeBooking) {
        let remaining = 20
        if (activeBooking.serviceStartedAt) {
          const elapsed = Math.round(
            (Date.now() - new Date(activeBooking.serviceStartedAt).getTime()) / 60000
          )
          remaining = Math.max(0, 30 - elapsed)
        }
        bayStates.push({
          bayNumber: i,
          isOccupied: true,
          currentBookingNumber:
            activeBooking.bookingNumber || String(activeBooking._id).slice(0, 8),
          vehiclePlate:
            activeBooking.walkInVehicle?.registrationNumber ||
            activeBooking.vehicleDetails?.registrationNumber ||
            "VEHICLE",
          serviceType: activeBooking.serviceType === "FULL" ? "Full Wash" : "Quick Wash",
          status: "IN_SERVICE",
          timeRemainingMinutes: remaining,
        })
      } else {
        bayStates.push({
          bayNumber: i,
          isOccupied: false,
          status: "AVAILABLE",
        })
      }
    }

    // 3. Hourly traffic today
    const hourlyMap = new Map<string, number>()
    for (let h = 8; h <= 20; h++) {
      const hourKey = `${String(h).padStart(2, "0")}:00`
      hourlyMap.set(hourKey, 0)
    }

    todayBookings.forEach((b) => {
      const targetTime = b.scheduling?.windowStart
        ? new Date(b.scheduling.windowStart)
        : new Date(b.createdAt)
      const hourStr = `${String(targetTime.getHours()).padStart(2, "0")}:00`
      if (hourlyMap.has(hourStr)) {
        hourlyMap.set(hourStr, (hourlyMap.get(hourStr) || 0) + 1)
      }
    })

    const hourlyTrafficToday: HourlyTrafficPoint[] = Array.from(hourlyMap.entries()).map(
      ([hour, count]) => ({
        hour,
        bookingsCount: count,
      })
    )

    // 4. Weekly Volume (past 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const weeklyRaw = await this.bookingModel.aggregate([
      {
        $match: {
          stationId: stationObjectId,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$pricingSnapshot.totalPrice" },
          bookingsCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const weeklyVolume: TimeSeriesPoint[] = weeklyRaw.map((w) => ({
      date: w._id,
      revenue: w.revenue || 0,
      bookingsCount: w.bookingsCount || 0,
    }))

    // 5. Upcoming / Today's Queue (Active / In progress / Pending check-in)
    const upcomingQueue = todayBookings
      .filter((b) =>
        ["CONFIRMED", "CHECKED_IN", "IN_SERVICE", "PAYMENT_PENDING"].includes(b.status)
      )
      .slice(0, 8)
      .map((b) => ({
        id: String(b._id),
        bookingNumber: b.bookingNumber || String(b._id).slice(0, 8),
        customerName: b.walkInCustomer?.name || b.customerDetails?.name || "Customer",
        customerPhone: b.walkInCustomer?.phone || b.customerDetails?.phone || undefined,
        vehiclePlate:
          b.walkInVehicle?.registrationNumber || b.vehicleDetails?.registrationNumber || "VEHICLE",
        serviceType: b.serviceType || "FULL",
        windowStart: b.scheduling?.windowStart
          ? new Date(b.scheduling.windowStart).toISOString()
          : new Date().toISOString(),
        windowEnd: b.scheduling?.windowEnd
          ? new Date(b.scheduling.windowEnd).toISOString()
          : new Date().toISOString(),
        status: b.status,
        amount: b.pricingSnapshot?.totalPrice || 0,
        isWalkIn: Boolean(b.isWalkIn),
      }))

    // 6. Recent reviews / flags for this station
    let activeIssues: Array<{
      id: string
      issueNumber: string
      title: string
      priority: string
      status: string
      reportedAt: string
    }> = []

    if (this.reviewModel) {
      const flaggedReviewsRaw: unknown = await this.reviewModel
        .find({
          stationId: stationObjectId,
          report_count: { $gt: 0 },
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()

      const flaggedReviews = flaggedReviewsRaw as AggregatedFlaggedReview[]

      activeIssues = flaggedReviews.map((rev) => ({
        id: String(rev._id),
        issueNumber: `REV-${String(rev._id).slice(-4).toUpperCase()}`,
        title: rev.comment
          ? `Reported Review: "${rev.comment.slice(0, 30)}..."`
          : "Flagged customer review",
        priority: (rev.report_count ?? 0) > 2 ? "HIGH" : "MEDIUM",
        status: "OPEN",
        reportedAt: rev.createdAt
          ? new Date(rev.createdAt).toISOString()
          : new Date().toISOString(),
      }))
    }

    return {
      station: {
        id: String(station._id),
        name: station.name || "Station",
        address: station.address?.street || undefined,
        city: station.address?.city || undefined,
        totalBays,
        rating: station.rating || 5.0,
        totalReviews: station.reviewCount || 0,
        status: station.status || "APPROVED",
      },
      kpis: {
        todayTotalScheduled: todayBookings.length,
        todayCheckedIn,
        todayInService,
        todayCompleted,
        todayNoShow,
        todayRevenue,
        bayOccupancyRate,
        averageServiceMinutes,
      },
      bayStates,
      hourlyTrafficToday,
      weeklyVolume,
      upcomingQueue,
      activeIssues,
    }
  }
}
