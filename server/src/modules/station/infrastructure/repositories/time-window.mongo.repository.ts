import { ITimeWindowRepository } from "../../domain/repositories/time-window.repository"
import { TimeWindowInstance } from "../../domain/entities/TimeWindowInstance"
import { TimeWindowModel } from "../models/time-window.model"
import { TimeWindowMapper } from "../mappers/time-window.mapper"
import { Types } from "mongoose"

export class TimeWindowMongoRepository implements ITimeWindowRepository {
  async updateExpiredWindowsStatus(now: Date = new Date()): Promise<number> {
    const res = await TimeWindowModel.updateMany(
      { windowEnd: { $lte: now }, status: { $in: ["OPEN", "FULL"] } },
      { $set: { status: "PAST" } }
    )
    return res.modifiedCount
  }

  async findByStationIdAndDate(stationId: string, date: string): Promise<TimeWindowInstance[]> {
    if (!Types.ObjectId.isValid(stationId)) return []
    await this.updateExpiredWindowsStatus()
    const docs = await TimeWindowModel.find({
      stationId: new Types.ObjectId(stationId),
      date,
    }).sort({ windowStart: 1 })

    return docs.map(TimeWindowMapper.toDomain)
  }

  async findByStationIdAndDateRange(
    stationId: string,
    startDate: string,
    endDate: string
  ): Promise<TimeWindowInstance[]> {
    if (!Types.ObjectId.isValid(stationId)) return []
    await this.updateExpiredWindowsStatus()
    const docs = await TimeWindowModel.find({
      stationId: new Types.ObjectId(stationId),
      date: { $gte: startDate, $lte: endDate },
    }).sort({ windowStart: 1 })

    return docs.map(TimeWindowMapper.toDomain)
  }

  async findLatestWindowDateForStation(stationId: string): Promise<string | null> {
    if (!Types.ObjectId.isValid(stationId)) return null
    const doc = await TimeWindowModel.findOne(
      { stationId: new Types.ObjectId(stationId) },
      { date: 1 }
    )
      .sort({ date: -1 })
      .lean()
    return doc ? (doc.date as string) : null
  }

  async findById(id: string): Promise<TimeWindowInstance | null> {
    if (!Types.ObjectId.isValid(id)) return null
    const doc = await TimeWindowModel.findById(id)
    if (!doc) return null
    return TimeWindowMapper.toDomain(doc)
  }

  async findByStationIdAndWindowStart(
    stationId: string,
    windowStart: Date
  ): Promise<TimeWindowInstance | null> {
    if (!Types.ObjectId.isValid(stationId)) return null
    const doc = await TimeWindowModel.findOne({
      stationId: new Types.ObjectId(stationId),
      windowStart,
    })
    if (!doc) return null
    return TimeWindowMapper.toDomain(doc)
  }

  async saveMany(windows: TimeWindowInstance[]): Promise<TimeWindowInstance[]> {
    if (windows.length === 0) return []

    const ops = windows.map((w) => {
      const raw = TimeWindowMapper.toPersistence(w)
      return {
        updateOne: {
          filter: {
            stationId: raw.stationId,
            windowStart: raw.windowStart,
          },
          update: { $setOnInsert: raw },
          upsert: true,
        },
      }
    })

    await TimeWindowModel.bulkWrite(ops, { ordered: false })

    const firstWindow = windows[0]
    const lastWindow = windows[windows.length - 1]
    if (!firstWindow || !lastWindow) return []

    return this.findByStationIdAndDateRange(
      firstWindow.stationId,
      firstWindow.date,
      lastWindow.date
    )
  }

  async save(window: TimeWindowInstance): Promise<TimeWindowInstance> {
    const raw = TimeWindowMapper.toPersistence(window)
    const updated = await TimeWindowModel.findOneAndUpdate(
      { stationId: raw.stationId, windowStart: raw.windowStart },
      { $set: raw },
      { upsert: true, new: true }
    )
    return TimeWindowMapper.toDomain(updated)
  }

  async reserveCapacityAtomically(windowId: string): Promise<TimeWindowInstance | null> {
    if (!Types.ObjectId.isValid(windowId)) return null

    // Atomic update condition: window must be OPEN and advanceBookedCount < (capacityTotal - walkInReservedSlots)
    const doc = await TimeWindowModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(windowId),
        status: "OPEN",
        $expr: {
          $lt: ["$advanceBookedCount", { $subtract: ["$capacityTotal", "$walkInReservedSlots"] }],
        },
      },
      {
        $inc: { advanceBookedCount: 1 },
      },
      { new: true }
    )

    if (!doc) return null

    // Check if new count reached capacity limit and update status to FULL
    const onlineCap = Math.max(0, doc.capacityTotal - doc.walkInReservedSlots)
    if (doc.advanceBookedCount >= onlineCap) {
      doc.status = "FULL"
      await doc.save()
    }

    return TimeWindowMapper.toDomain(doc)
  }

  async deleteByStationId(stationId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(stationId)) return false
    const res = await TimeWindowModel.deleteMany({ stationId: new Types.ObjectId(stationId) })
    return res.deletedCount > 0
  }

  async deleteUnbookedFutureWindows(
    stationId: string,
    fromDate: Date = new Date()
  ): Promise<number> {
    if (!Types.ObjectId.isValid(stationId)) return 0
    const startOfFromDate = new Date(
      fromDate.getFullYear(),
      fromDate.getMonth(),
      fromDate.getDate()
    )
    const res = await TimeWindowModel.deleteMany({
      stationId: new Types.ObjectId(stationId),
      advanceBookedCount: 0,
      windowEnd: { $gte: startOfFromDate },
    })
    return res.deletedCount
  }
}
