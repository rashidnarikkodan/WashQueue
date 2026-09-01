import { BaseRepository } from "@/infrastructure/database/repository/base.repository"
import { ISettlementRepository } from "../../domain/repositories/settlement.repository"
import { Settlement, SettlementProps, SettlementStatus } from "../../domain/entities/Settlement"
import SettlementModel, { ISettlementDocument } from "../models/settlement.model"
import { SettlementMapper } from "../mappers/settlement.mapper"
import {
  AdminSettlementMetricsDTO,
  OwnerEarningsSummaryDTO,
  SettlementFilterOptions,
} from "../../application/dtos/settlement.dto"

export class SettlementRepository
  extends BaseRepository<Settlement, ISettlementDocument>
  implements ISettlementRepository
{
  constructor() {
    super(SettlementModel, new SettlementMapper())
  }

  async findByBookingId(bookingId: string): Promise<Settlement | null> {
    const doc = await this.model.findOne({ bookingId }).exec()
    return doc ? this.mapper.toDomain(doc) : null
  }

  async findMany(
    filters: SettlementFilterOptions
  ): Promise<{ settlements: Settlement[]; total: number }> {
    const query: Record<string, unknown> = {}

    if (filters.ownerId) {
      query.ownerId = filters.ownerId
    }

    if (filters.stationId) {
      query.stationId = filters.stationId
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query.status = { $in: filters.status }
      } else {
        query.status = filters.status
      }
    }

    if (filters.startDate || filters.endDate) {
      const dateQuery: Record<string, unknown> = {}
      if (filters.startDate) dateQuery.$gte = filters.startDate
      if (filters.endDate) dateQuery.$lte = filters.endDate
      query.createdAt = dateQuery
    }

    if (filters.search && filters.search.trim()) {
      const searchRegex = new RegExp(filters.search.trim(), "i")
      query.$or = [{ bookingId: searchRegex }, { transferId: searchRegex }]
    }

    const page = Math.max(Number(filters.page) || 1, 1)
    const limit = Math.max(Number(filters.limit) || 10, 1)
    const skip = (page - 1) * limit

    const [total, docs] = await Promise.all([
      this.model.countDocuments(query).exec(),
      this.model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
    ])

    return {
      settlements: docs.map((doc) => this.mapper.toDomain(doc)),
      total,
    }
  }

  async getOwnerAggregatedEarnings(
    ownerId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Omit<OwnerEarningsSummaryDTO, "payoutAccountStatus">> {
    const matchStage: Record<string, unknown> = { ownerId }

    if (startDate || endDate) {
      const dateQuery: Record<string, unknown> = {}
      if (startDate) dateQuery.$gte = startDate
      if (endDate) dateQuery.$lte = endDate
      matchStage.createdAt = dateQuery
    }

    const [result] = await this.model.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalGrossRevenue: { $sum: "$totalAmount" },
          totalPlatformCommission: { $sum: "$platformCommission" },
          totalNetEarnings: { $sum: "$stationSettlementAmount" },
          settledAmount: {
            $sum: {
              $cond: [
                { $eq: ["$status", SettlementStatus.SETTLED] },
                "$stationSettlementAmount",
                0,
              ],
            },
          },
          pendingAmount: {
            $sum: {
              $cond: [
                { $eq: ["$status", SettlementStatus.PENDING] },
                "$stationSettlementAmount",
                0,
              ],
            },
          },
          processingAmount: {
            $sum: {
              $cond: [
                { $eq: ["$status", SettlementStatus.PROCESSING] },
                "$stationSettlementAmount",
                0,
              ],
            },
          },
          heldAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", SettlementStatus.HELD] }, "$stationSettlementAmount", 0],
            },
          },
          failedAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", SettlementStatus.FAILED] }, "$stationSettlementAmount", 0],
            },
          },
          completedBookingsCount: { $sum: 1 },
        },
      },
    ])

    return {
      totalGrossRevenue: Number((result?.totalGrossRevenue || 0).toFixed(2)),
      totalPlatformCommission: Number((result?.totalPlatformCommission || 0).toFixed(2)),
      totalNetEarnings: Number((result?.totalNetEarnings || 0).toFixed(2)),
      settledAmount: Number((result?.settledAmount || 0).toFixed(2)),
      pendingAmount: Number((result?.pendingAmount || 0).toFixed(2)),
      processingAmount: Number((result?.processingAmount || 0).toFixed(2)),
      heldAmount: Number((result?.heldAmount || 0).toFixed(2)),
      failedAmount: Number((result?.failedAmount || 0).toFixed(2)),
      completedBookingsCount: result?.completedBookingsCount || 0,
    }
  }

  async getAdminAggregatedMetrics(
    startDate?: Date,
    endDate?: Date
  ): Promise<AdminSettlementMetricsDTO> {
    const matchStage: Record<string, unknown> = {}

    if (startDate || endDate) {
      const dateQuery: Record<string, unknown> = {}
      if (startDate) dateQuery.$gte = startDate
      if (endDate) dateQuery.$lte = endDate
      matchStage.createdAt = dateQuery
    }

    const [result] = await this.model.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalPlatformCommission: { $sum: "$platformCommission" },
          totalGrossVolume: { $sum: "$totalAmount" },
          totalSettledAmount: {
            $sum: {
              $cond: [
                { $eq: ["$status", SettlementStatus.SETTLED] },
                "$stationSettlementAmount",
                0,
              ],
            },
          },
          totalPendingAmount: {
            $sum: {
              $cond: [
                {
                  $in: ["$status", [SettlementStatus.PENDING, SettlementStatus.PROCESSING]],
                },
                "$stationSettlementAmount",
                0,
              ],
            },
          },
          totalHeldAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", SettlementStatus.HELD] }, "$stationSettlementAmount", 0],
            },
          },
          totalFailedAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", SettlementStatus.FAILED] }, "$stationSettlementAmount", 0],
            },
          },
          totalSettlementsCount: { $sum: 1 },
          pendingCount: {
            $sum: {
              $cond: [
                {
                  $in: ["$status", [SettlementStatus.PENDING, SettlementStatus.PROCESSING]],
                },
                1,
                0,
              ],
            },
          },
          heldCount: {
            $sum: { $cond: [{ $eq: ["$status", SettlementStatus.HELD] }, 1, 0] },
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ["$status", SettlementStatus.FAILED] }, 1, 0] },
          },
          settledCount: {
            $sum: { $cond: [{ $eq: ["$status", SettlementStatus.SETTLED] }, 1, 0] },
          },
        },
      },
    ])

    return {
      totalPlatformCommission: Number((result?.totalPlatformCommission || 0).toFixed(2)),
      totalGrossVolume: Number((result?.totalGrossVolume || 0).toFixed(2)),
      totalSettledAmount: Number((result?.totalSettledAmount || 0).toFixed(2)),
      totalPendingAmount: Number((result?.totalPendingAmount || 0).toFixed(2)),
      totalHeldAmount: Number((result?.totalHeldAmount || 0).toFixed(2)),
      totalFailedAmount: Number((result?.totalFailedAmount || 0).toFixed(2)),
      totalSettlementsCount: result?.totalSettlementsCount || 0,
      pendingCount: result?.pendingCount || 0,
      heldCount: result?.heldCount || 0,
      failedCount: result?.failedCount || 0,
      settledCount: result?.settledCount || 0,
    }
  }

  async updateStatusWithGuard(
    id: string,
    newStatus: SettlementStatus,
    allowedCurrentStatuses: SettlementStatus[],
    updates?: Partial<SettlementProps>
  ): Promise<Settlement | null> {
    const updateObj: Record<string, unknown> = {
      status: newStatus,
      updatedAt: new Date(),
    }

    if (updates) {
      if (updates.transferId !== undefined) updateObj.transferId = updates.transferId
      if (updates.holdReason !== undefined) updateObj.holdReason = updates.holdReason
      if (updates.failureReason !== undefined) updateObj.failureReason = updates.failureReason
      if (updates.retryCount !== undefined) updateObj.retryCount = updates.retryCount
      if (updates.lastRetriedAt !== undefined) updateObj.lastRetriedAt = updates.lastRetriedAt
      if (updates.settledAt !== undefined) updateObj.settledAt = updates.settledAt
    }

    const doc = await this.model
      .findOneAndUpdate(
        {
          _id: id,
          status: { $in: allowedCurrentStatuses },
        },
        { $set: updateObj },
        { new: true }
      )
      .exec()

    return doc ? this.mapper.toDomain(doc) : null
  }
}
