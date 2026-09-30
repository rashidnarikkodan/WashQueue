import { BaseRepository } from "@/infrastructure/database/repository/base.repository"
import {
  IFraudEventRepository,
  FraudEventFilterOptions,
  UserFraudProfileSummary,
  FraudDashboardMetrics,
  WatchlistUserItem,
  SecurityLogItem,
} from "../../domain/repositories/fraud-event.repository.interface"
import { FraudEvent } from "../../domain/entities/fraud-event.entity"
import { FraudEventModel, IFraudEventDoc } from "../model/fraud-event.mongo-schema"
import { RiskLevel, FraudEventStatus } from "../../domain/value-objects/fraud-types.vo"
import { FraudEventMapper } from "../mappers/fraud-event.mapper"

export class FraudEventMongoRepository
  extends BaseRepository<FraudEvent, IFraudEventDoc>
  implements IFraudEventRepository
{
  constructor() {
    super(FraudEventModel, new FraudEventMapper())
  }

  // for showing, i added mock data of user to fraude event doc.
  private async ensureSeeded(): Promise<void> {
    const count = await this.model.countDocuments().exec()
    if (count > 0) return

    await this.model.insertMany([
      {
        userId: "usr_rogers_92",
        actorType: "OWNER",
        entityType: "BOOKING",
        entityId: "bk_98214",
        eventType: "BOOKING_CANCELLED",
        riskScore: 78,
        riskLevel: RiskLevel.HIGH,
        status: FraudEventStatus.OPEN,
        reason: "Repeatedly canceling bookings within 10 mins of scheduled start",
        signals: [
          {
            code: "OPS_SUSPICIOUS_MANUAL_CANCEL",
            description: "Owner cancelled 6 bookings within 2 hours",
            score: 45,
            metadata: { cancellationCount: 6, periodHours: 2 },
          },
          {
            code: "CUST_EXCESSIVE_CANCELLATIONS",
            description: "Threshold exceeded for station schedule slots",
            score: 33,
          },
        ],
        metadata: {
          userName: "Sarah Rogers",
          userEmail: "s.rogers@owner.com",
          userAvatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
          stationId: "st_metro_wash_1",
          cancellationRate: 72,
        },
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        userId: "usr_mercer_11",
        actorType: "CUSTOMER",
        entityType: "REVIEW",
        entityId: "rev_3321",
        eventType: "REVIEW_SUBMITTED",
        riskScore: 55,
        riskLevel: RiskLevel.MEDIUM,
        status: FraudEventStatus.OPEN,
        reason: "Submitted five 1-star reviews in the last 60 seconds",
        signals: [
          {
            code: "CUST_SUSPICIOUS_REVIEW",
            description: "Burst review submission velocity detected",
            score: 35,
            metadata: { reviewCount: 5, periodSeconds: 60 },
          },
          {
            code: "BOOKING_UNUSUAL_FREQUENCY",
            description: "Multiple reviews without verified wash completion",
            score: 20,
          },
        ],
        metadata: {
          userName: "Alex Mercer",
          userEmail: "mercer.a@washqueue.com",
          userAvatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          cancellationRate: 12,
        },
        createdAt: new Date(Date.now() - 42 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        userId: "usr_davis_84",
        actorType: "CUSTOMER",
        entityType: "USER",
        entityId: "usr_davis_84",
        eventType: "USER_LOGIN_FAILED",
        riskScore: 35,
        riskLevel: RiskLevel.LOW,
        status: FraudEventStatus.OPEN,
        reason: "Linked to account ID #9821 via device fingerprinting",
        signals: [
          {
            code: "ACCT_DEVICE_SHARING",
            description: "Same hardware device linked to multiple user accounts",
            score: 35,
            metadata: { deviceId: "fp_ios_a94f10", associatedAccounts: 4 },
          },
        ],
        metadata: {
          userName: "Jordan Davis",
          userEmail: "j_davis@gmail.com",
          deviceId: "fp_ios_a94f10",
          cancellationRate: 5,
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        userId: "usr_vance_55",
        actorType: "MANAGER",
        entityType: "BOOKING",
        entityId: "bk_flapped_1",
        eventType: "QUEUE_STATUS_UPDATED",
        riskScore: 68,
        riskLevel: RiskLevel.MEDIUM,
        status: FraudEventStatus.OPEN,
        reason: "Manipulating bay queue statuses rapidly",
        signals: [
          {
            code: "OPS_STATUS_FLAPPING",
            description:
              "Booking status shifted between IN_PROGRESS and STALLED 4 times in 20 minutes",
            score: 38,
          },
          {
            code: "OPS_EXCESSIVE_WALKINS",
            description: "High manual walk-in volume registered outside shift hours",
            score: 30,
          },
        ],
        metadata: {
          userName: "Marcus Vance",
          userEmail: "m.vance@station.org",
          stationId: "st_metro_wash_2",
          cancellationRate: 34,
        },
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        userId: "usr_rostova_34",
        actorType: "CUSTOMER",
        entityType: "PAYMENT",
        entityId: "pay_fail_99",
        eventType: "PAYMENT_FAILED",
        riskScore: 82,
        riskLevel: RiskLevel.HIGH,
        status: FraudEventStatus.OPEN,
        reason: "Repeated payment gateway declines and rapid card testing attempts",
        signals: [
          {
            code: "CUST_EXCESSIVE_PAYMENT_FAILURES",
            description: "4 failed payment attempts in 10 minutes",
            score: 45,
          },
          {
            code: "ACCT_LOGIN_VELOCITY",
            description: "Failed login velocity exceeded threshold",
            score: 37,
          },
        ],
        metadata: {
          userName: "Elena Rostova",
          userEmail: "e.rostova@gmail.com",
          cancellationRate: 18,
        },
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ])
  }

  async findWithFilters(
    filters: FraudEventFilterOptions
  ): Promise<{ items: FraudEvent[]; total: number }> {
    await this.ensureSeeded()

    const query: Record<string, unknown> = {}

    if (filters.userId) query.userId = filters.userId
    if (filters.status) query.status = filters.status
    if (filters.riskLevel) query.riskLevel = filters.riskLevel
    if (filters.actorType) query.actorType = filters.actorType
    if (filters.entityType) query.entityType = filters.entityType
    if (filters.stationId) query["metadata.stationId"] = filters.stationId

    if (filters.startDate || filters.endDate) {
      const dateRange: Record<string, Date> = {}
      if (filters.startDate) dateRange.$gte = filters.startDate
      if (filters.endDate) dateRange.$lte = filters.endDate
      query.createdAt = dateRange
    }

    if (filters.search && filters.search.trim()) {
      const searchRegex = new RegExp(filters.search.trim(), "i")
      query.$or = [
        { reason: searchRegex },
        { eventType: searchRegex },
        { userId: searchRegex },
        { "metadata.userName": searchRegex },
        { "metadata.userEmail": searchRegex },
      ]
    }

    const page = Math.max(1, filters.page ?? 1)
    const limit = Math.max(1, Math.min(100, filters.limit ?? 20))
    const skip = (page - 1) * limit

    const [docs, total] = await Promise.all([
      this.model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.model.countDocuments(query).exec(),
    ])

    return {
      items: docs.map((d) => this.mapper.toDomain(d)),
      total,
    }
  }

  async findByUserId(userId: string, limit = 10): Promise<FraudEvent[]> {
    await this.ensureSeeded()
    const docs = await this.model.find({ userId }).sort({ createdAt: -1 }).limit(limit).exec()
    return docs.map((d) => this.mapper.toDomain(d))
  }

  async getUserFraudSummary(userId: string): Promise<UserFraudProfileSummary> {
    await this.ensureSeeded()
    const [stats] = await this.model.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$userId",
          totalEvents: { $sum: 1 },
          highRiskCount: {
            $sum: { $cond: [{ $eq: ["$riskLevel", RiskLevel.HIGH] }, 1, 0] },
          },
          mediumRiskCount: {
            $sum: { $cond: [{ $eq: ["$riskLevel", RiskLevel.MEDIUM] }, 1, 0] },
          },
          openEventsCount: {
            $sum: { $cond: [{ $eq: ["$status", FraudEventStatus.OPEN] }, 1, 0] },
          },
          lastEventDate: { $max: "$createdAt" },
          highestRiskScore: { $max: "$riskScore" },
        },
      },
    ])

    if (!stats) {
      return {
        userId,
        totalEvents: 0,
        highRiskCount: 0,
        mediumRiskCount: 0,
        openEventsCount: 0,
        lastEventDate: null,
        highestRiskScore: 0,
      }
    }

    return {
      userId,
      totalEvents: stats.totalEvents,
      highRiskCount: stats.highRiskCount,
      mediumRiskCount: stats.mediumRiskCount,
      openEventsCount: stats.openEventsCount,
      lastEventDate: stats.lastEventDate,
      highestRiskScore: stats.highestRiskScore,
    }
  }

  async getDashboardMetrics(startDate?: Date, endDate?: Date): Promise<FraudDashboardMetrics> {
    await this.ensureSeeded()

    const query: Record<string, unknown> = {}
    if (startDate || endDate) {
      const dateRange: Record<string, Date> = {}
      if (startDate) dateRange.$gte = startDate
      if (endDate) dateRange.$lte = endDate
      query.createdAt = dateRange
    }

    const [aggregations, failedLogins, highRiskUsers] = await Promise.all([
      this.model.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalAlerts: { $sum: 1 },
            highRiskCount: {
              $sum: { $cond: [{ $eq: ["$riskLevel", RiskLevel.HIGH] }, 1, 0] },
            },
            mediumRiskCount: {
              $sum: { $cond: [{ $eq: ["$riskLevel", RiskLevel.MEDIUM] }, 1, 0] },
            },
            lowRiskCount: {
              $sum: { $cond: [{ $eq: ["$riskLevel", RiskLevel.LOW] }, 1, 0] },
            },
            openAlertsCount: {
              $sum: { $cond: [{ $eq: ["$status", FraudEventStatus.OPEN] }, 1, 0] },
            },
            criticalThreatsCount: {
              $sum: { $cond: [{ $gte: ["$riskScore", 80] }, 1, 0] },
            },
          },
        },
      ]),
      this.model
        .countDocuments({
          ...query,
          eventType: "USER_LOGIN_FAILED",
        })
        .exec(),
      this.model
        .distinct("userId", {
          ...query,
          riskLevel: RiskLevel.HIGH,
        })
        .exec(),
    ])

    const stats = aggregations[0] || {
      totalAlerts: 0,
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
      openAlertsCount: 0,
      criticalThreatsCount: 0,
    }

    return {
      totalAlerts: stats.totalAlerts,
      highRiskCount: stats.highRiskCount,
      mediumRiskCount: stats.mediumRiskCount,
      lowRiskCount: stats.lowRiskCount,
      openAlertsCount: stats.openAlertsCount,
      highRiskUsersCount: highRiskUsers.length,
      suspendedAccountsCount: Math.max(0, Math.floor(stats.highRiskCount * 0.4)),
      failedLoginsCount: failedLogins,
      criticalThreatsCount: stats.criticalThreatsCount,
      alertsTrend: "+12% vs last week",
      highRiskTrend: "-2% vs last week",
      loginsTrend: "+24% vs last week",
    }
  }

  async getWatchlist(): Promise<WatchlistUserItem[]> {
    await this.ensureSeeded()

    const docs = await this.model.find({}).sort({ riskScore: -1, createdAt: -1 }).limit(20).exec()

    const userMap = new Map<string, WatchlistUserItem>()

    docs.forEach((doc) => {
      if (!userMap.has(doc.userId)) {
        const role =
          doc.actorType === "OWNER" ? "Owner" : doc.actorType === "MANAGER" ? "Manager" : "Customer"

        const cancellationRate =
          typeof doc.metadata?.cancellationRate === "number"
            ? doc.metadata.cancellationRate
            : Math.min(95, Math.max(10, doc.riskScore))

        const primarySignal = doc.signals?.[0]?.code || doc.eventType

        const duplicateSignalStatus: WatchlistUserItem["duplicateSignalStatus"] =
          doc.riskLevel === RiskLevel.HIGH
            ? "YES (HIGH)"
            : doc.riskLevel === RiskLevel.MEDIUM
              ? "SUSPICIOUS"
              : "No Match"

        const status: WatchlistUserItem["status"] =
          doc.status === FraudEventStatus.RESOLVED
            ? "FLAGGED"
            : doc.status === FraudEventStatus.REVIEWING
              ? "UNDER REVIEW"
              : "ACTIVE"

        userMap.set(doc.userId, {
          id: doc.userId,
          name: (doc.metadata?.userName as string) || `User ${doc.userId.slice(-6)}`,
          email: (doc.metadata?.userEmail as string) || `${doc.userId.slice(-6)}@washqueue.com`,
          avatar: doc.metadata?.userAvatar as string | undefined,
          role,
          riskScore: doc.riskScore,
          cancellationRate,
          primarySignal,
          duplicateSignalStatus,
          status,
          lastActive: new Date(doc.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })
      }
    })

    return Array.from(userMap.values())
  }

  async getSecurityLogs(): Promise<SecurityLogItem[]> {
    await this.ensureSeeded()

    const docs = await this.model.find({}).sort({ createdAt: -1 }).limit(10).exec()

    return docs.map((doc, idx) => {
      let type: SecurityLogItem["type"] = "BURST_ATTEMPT"
      if (doc.eventType === "USER_LOGIN_FAILED") {
        type = "LOGIN_FAILED"
      } else if (doc.signals.some((s) => s.code.includes("DEVICE"))) {
        type = "DEVICE_FLAGGED"
      } else if (doc.signals.some((s) => s.code.includes("FLAPPING"))) {
        type = "STATUS_FLAPPED"
      } else if (doc.signals.some((s) => s.code.includes("GEO"))) {
        type = "UNUSUAL_GEO"
      }

      const title = doc.signals[0]?.code
        ? doc.signals[0].code.replace(/_/g, " ")
        : doc.eventType.replace(/_/g, " ")

      const ip = (doc.metadata?.ipAddress as string) || "192.168.***.***"
      const meta = `${doc.actorType} • ${new Date(doc.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`

      return {
        id: doc._id.toString() || `log-${idx}`,
        type,
        title,
        ip,
        meta,
        description: doc.reason,
        timestamp: new Date(doc.createdAt).toLocaleTimeString(),
        severity: doc.riskLevel,
      }
    })
  }
}
