import redis from "@/infrastructure/cache/redis.client"
import logger from "@/configs/logger.config"
import { Booking, BookingStatus } from "@/modules/booking/domain/entities/Booking"
import { IBookingQueueService } from "../../application/interfaces/booking-queue.interface"
import {
  OperationalQueueItemDTO,
  OperationalStationQueueDTO,
} from "../../application/dtos/operational-queue.dto"
import { BookingModel } from "@/modules/booking/infrastructure/models/booking.model"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { BookingMapper } from "@/modules/booking/infrastructure/mappers/booking.mapper"
import { IBookingStatusLogRepository } from "@/modules/booking/domain/repositories/booking-status-log.repository"
import { BookingStatusLog } from "@/modules/booking/domain/entities/BookingStatusLog"

export class BookingRedisQueueService implements IBookingQueueService {
  constructor(
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly stationRepository: IStationRepository
  ) {}

  private computeOrderScore(booking: Booking): number {
    const checkedInTs = booking.checkedInAt ? new Date(booking.checkedInAt).getTime() : Date.now()
    if (!booking.isWalkIn && booking.scheduling && booking.scheduling.windowStart) {
      const windowStartTs = new Date(booking.scheduling.windowStart).getTime()
      return Math.min(windowStartTs, checkedInTs)
    }
    return checkedInTs
  }

  async pushToStationQueue(booking: Booking): Promise<void> {
    try {
      const stationId = booking.stationId
      const bookingId = booking.id
      const queueKey = `queue:station:${stationId}:waiting`
      const activeKey = `queue:station:${stationId}:active`
      const bookingKey = `queue:booking:${bookingId}`
      const metaKey = `queue:station:${stationId}:meta`

      const score = this.computeOrderScore(booking)
      const now = Date.now()

      await redis.zadd(queueKey, score, bookingId)

      await redis.srem(activeKey, bookingId)

      await redis.hset(bookingKey, {
        bookingId,
        bookingNumber: booking.bookingNumber,
        stationId,
        status: booking.status,
        serviceType: booking.serviceType,
        isWalkIn: booking.isWalkIn ? "true" : "false",
        checkedInAt: (booking.checkedInAt
          ? new Date(booking.checkedInAt).getTime()
          : now
        ).toString(),
        windowStart: booking.scheduling?.windowStart
          ? new Date(booking.scheduling.windowStart).toISOString()
          : "",
        windowEnd: booking.scheduling?.windowEnd
          ? new Date(booking.scheduling.windowEnd).toISOString()
          : "",
      })

      const queueDepth = await redis.zcard(queueKey)
      const activeCount = await redis.scard(activeKey)
      await redis.hset(metaKey, {
        queueDepth: queueDepth.toString(),
        activeCount: activeCount.toString(),
        updatedAt: now.toString(),
      })

      logger.info({ bookingId, stationId, score }, "[RedisQueue] Booking pushed to waiting queue")
    } catch (error) {
      logger.error(
        { error, bookingId: booking.id },
        "[RedisQueue] Redis failure during pushToStationQueue"
      )
    }
  }

  async updateQueueStatus(booking: Booking): Promise<void> {
    try {
      const stationId = booking.stationId
      const bookingId = booking.id
      const queueKey = `queue:station:${stationId}:waiting`
      const activeKey = `queue:station:${stationId}:active`
      const bookingKey = `queue:booking:${bookingId}`
      const metaKey = `queue:station:${stationId}:meta`

      const now = Date.now()

      if (booking.status === BookingStatus.IN_SERVICE) {
        await redis.zrem(queueKey, bookingId)
        await redis.sadd(activeKey, bookingId)
        await redis.hset(bookingKey, {
          status: booking.status,
          serviceStartedAt: (booking.serviceStartedAt
            ? new Date(booking.serviceStartedAt).getTime()
            : now
          ).toString(),
        })
      } else if (
        [BookingStatus.SERVICE_COMPLETED, BookingStatus.AWAITING_HANDOVER].includes(booking.status)
      ) {
        await redis.hset(bookingKey, "status", booking.status)
      } else if (
        [BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.NO_SHOW].includes(
          booking.status
        )
      ) {
        await redis.zrem(queueKey, bookingId)
        await redis.srem(activeKey, bookingId)
        await redis.del(bookingKey)
      } else {
        await redis.hset(bookingKey, "status", booking.status)
      }

      const queueDepth = await redis.zcard(queueKey)
      const activeCount = await redis.scard(activeKey)
      await redis.hset(metaKey, {
        queueDepth: queueDepth.toString(),
        activeCount: activeCount.toString(),
        updatedAt: now.toString(),
      })

      logger.info(
        { bookingId, status: booking.status },
        "[RedisQueue] Updated booking queue status in Redis"
      )
    } catch (error) {
      logger.error(
        { error, bookingId: booking.id },
        "[RedisQueue] Redis failure during updateQueueStatus"
      )
    }
  }

  async getOperationalQueue(
    stationId: string,
    totalBays: number
  ): Promise<OperationalStationQueueDTO | null> {
    try {
      const queueKey = `queue:station:${stationId}:waiting`
      const activeKey = `queue:station:${stationId}:active`

      const exists = await redis.exists(queueKey)
      if (!exists) {
        return await this.reconcileStationQueue(stationId, { syncRedis: true })
      }

      const waitingBookingIds = await redis.zrange(queueKey, 0, "-1")
      const activeBookingIds = await redis.smembers(activeKey)

      const totalActiveAndWaiting = waitingBookingIds.length + activeBookingIds.length
      if (totalActiveAndWaiting === 0) {
        return {
          stationId,
          stationName: "",
          totalBays,
          activeServicesCount: 0,
          availableBays: totalBays,
          queueDepth: 0,
          totalActiveAndWaiting: 0,
          averageWashDurationMinutes: 25,
          waitingQueue: [],
          activeServices: [],
          reconciledWithMongo: false,
        }
      }

      return await this.reconcileStationQueue(stationId, { syncRedis: false })
    } catch (error) {
      logger.error(
        { error, stationId },
        "[RedisQueue] Failed to read queue from Redis; falling back to MongoDB reconciliation"
      )
      return await this.reconcileStationQueue(stationId, { syncRedis: true })
    }
  }

  private computeDynamicServiceDurationMinutes(
    booking: Booking,
    historicalAvgMinutes?: number
  ): number {
    const baseMinutes = booking.serviceType === "FULL" ? 40 : 20
    const extraServicesMinutes = (booking.extraServices?.length || 0) * 5

    const modelLower = (booking.vehicleDetails?.model || "").toLowerCase()
    let classModifier = 0
    if (
      modelLower.includes("suv") ||
      modelLower.includes("luxury") ||
      modelLower.includes("fortuner") ||
      modelLower.includes("endeavour")
    ) {
      classModifier = 10
    } else if (
      modelLower.includes("van") ||
      modelLower.includes("heavy") ||
      modelLower.includes("truck")
    ) {
      classModifier = 15
    }

    const calculated = baseMinutes + extraServicesMinutes + classModifier

    if (historicalAvgMinutes && historicalAvgMinutes >= 10 && historicalAvgMinutes <= 120) {
      return Math.round((calculated + historicalAvgMinutes) / 2)
    }
    return calculated
  }

  async reconcileStationQueue(
    stationId: string,
    options: { syncRedis?: boolean } = {}
  ): Promise<OperationalStationQueueDTO> {
    const syncRedis = options.syncRedis ?? true
    const queueKey = `queue:station:${stationId}:waiting`
    const activeKey = `queue:station:${stationId}:active`
    const metaKey = `queue:station:${stationId}:meta`

    let totalBays = 1
    const station = await this.stationRepository.findById(stationId)
    const stationProps = station?.getProps()
    if (
      stationProps &&
      stationProps.slotConfig &&
      typeof stationProps.slotConfig.bays === "number"
    ) {
      totalBays = Math.max(1, stationProps.slotConfig.bays)
    }

    let historicalAvgMinutes: number | undefined
    try {
      const historyDocs = await BookingModel.find({
        stationId,
        status: { $in: [BookingStatus.COMPLETED, BookingStatus.SERVICE_COMPLETED] },
        serviceStartedAt: { $exists: true, $ne: null },
        serviceCompletedAt: { $exists: true, $ne: null },
      })
        .sort({ serviceCompletedAt: -1 })
        .limit(10)
        .exec()

      if (historyDocs.length > 0) {
        const totalDuration = historyDocs.reduce((acc, doc) => {
          const start = new Date(doc.serviceStartedAt!).getTime()
          const end = new Date(doc.serviceCompletedAt!).getTime()
          const mins = Math.max(5, Math.round((end - start) / 60000))
          return acc + mins
        }, 0)
        historicalAvgMinutes = Math.round(totalDuration / historyDocs.length)
      }
    } catch {}

    const activeDocs = await BookingModel.find({
      stationId,
      status: {
        $in: [
          BookingStatus.CHECKED_IN,
          BookingStatus.IN_SERVICE,
          BookingStatus.SERVICE_COMPLETED,
          BookingStatus.AWAITING_HANDOVER,
        ],
      },
    })
      .populate("stationId")
      .populate("vehicleId")
      .populate("userId")
      .exec()

    const domainBookings = activeDocs.map((doc) => BookingMapper.toDomain(doc))

    const activeServicesList: Booking[] = []
    const waitingList: Booking[] = []

    for (const b of domainBookings) {
      if (b.status === BookingStatus.CHECKED_IN) {
        waitingList.push(b)
      } else {
        activeServicesList.push(b)
      }
    }

    waitingList.sort((a, b) => this.computeOrderScore(a) - this.computeOrderScore(b))

    const activeServicesCount = activeServicesList.length
    const availableBays = Math.max(0, totalBays - activeServicesCount)
    const queueDepth = waitingList.length
    const avgDuration = historicalAvgMinutes || 25

    const activeItems: OperationalQueueItemDTO[] = activeServicesList.map((b, idx) => {
      const customerName =
        b.customerDetails?.name ||
        b.walkInCustomer?.name ||
        (b.isWalkIn ? "Walk-In Customer" : "Customer")
      const phone = b.customerDetails?.phone || b.walkInCustomer?.phone || ""
      const reg =
        b.vehicleDetails?.registrationNumber || b.walkInVehicle?.registrationNumber || "N/A"

      return {
        bookingId: b.id,
        bookingNumber: b.bookingNumber,
        stationId: b.stationId,
        status: b.status,
        serviceType: b.serviceType,
        isWalkIn: b.isWalkIn,
        customerName,
        customerPhone: phone,
        registrationNumber: reg,
        vehicleModel: b.vehicleDetails?.model || "Standard Vehicle",
        windowStart: b.scheduling?.windowStart
          ? new Date(b.scheduling.windowStart).toISOString()
          : undefined,
        windowEnd: b.scheduling?.windowEnd
          ? new Date(b.scheduling.windowEnd).toISOString()
          : undefined,
        checkedInAt: b.checkedInAt ? new Date(b.checkedInAt).toISOString() : undefined,
        serviceStartedAt: b.serviceStartedAt
          ? new Date(b.serviceStartedAt).toISOString()
          : undefined,
        completedAt: b.completedAt ? new Date(b.completedAt).toISOString() : undefined,
        queuePosition: 0,
        isBayActive: true,
        assignedBayNumber: (idx % totalBays) + 1,
        estimatedWaitMinutes: 0,
      }
    })

    const nowMs = Date.now()
    const bayFinishMinutes: number[] = []

    for (let i = 0; i < totalBays; i++) {
      const activeB = activeServicesList[i]
      if (activeB) {
        const duration = this.computeDynamicServiceDurationMinutes(activeB, historicalAvgMinutes)
        const startMs = activeB.serviceStartedAt
          ? new Date(activeB.serviceStartedAt).getTime()
          : nowMs
        const elapsedMinutes = Math.max(0, (nowMs - startMs) / (1000 * 60))
        const remainingMinutes = Math.max(1, Math.round(duration - elapsedMinutes))
        bayFinishMinutes.push(remainingMinutes)
      } else {
        bayFinishMinutes.push(0)
      }
    }

    const waitingItems: OperationalQueueItemDTO[] = waitingList.map((b, idx) => {
      const position = idx + 1
      const customerName =
        b.customerDetails?.name ||
        b.walkInCustomer?.name ||
        (b.isWalkIn ? "Walk-In Customer" : "Customer")
      const phone = b.customerDetails?.phone || b.walkInCustomer?.phone || ""
      const reg =
        b.vehicleDetails?.registrationNumber || b.walkInVehicle?.registrationNumber || "N/A"

      bayFinishMinutes.sort((x, y) => x - y)
      const estimatedWaitMinutes = bayFinishMinutes[0] ?? 0
      const estimatedServiceStart = new Date(nowMs + estimatedWaitMinutes * 60 * 1000).toISOString()

      const duration = this.computeDynamicServiceDurationMinutes(b, historicalAvgMinutes)
      bayFinishMinutes[0] = (bayFinishMinutes[0] ?? 0) + duration

      return {
        bookingId: b.id,
        bookingNumber: b.bookingNumber,
        stationId: b.stationId,
        status: b.status,
        serviceType: b.serviceType,
        isWalkIn: b.isWalkIn,
        customerName,
        customerPhone: phone,
        registrationNumber: reg,
        vehicleModel: b.vehicleDetails?.model || "Standard Vehicle",
        windowStart: b.scheduling?.windowStart
          ? new Date(b.scheduling.windowStart).toISOString()
          : undefined,
        windowEnd: b.scheduling?.windowEnd
          ? new Date(b.scheduling.windowEnd).toISOString()
          : undefined,
        checkedInAt: b.checkedInAt ? new Date(b.checkedInAt).toISOString() : undefined,
        queuePosition: position,
        isBayActive: false,
        estimatedWaitMinutes,
        estimatedServiceStart,
      }
    })

    if (syncRedis) {
      try {
        await redis.del(queueKey)
        await redis.del(activeKey)

        for (const b of waitingList) {
          const score = this.computeOrderScore(b)
          await redis.zadd(queueKey, score, b.id)
        }

        for (const b of activeServicesList) {
          await redis.sadd(activeKey, b.id)
        }

        await redis.hset(metaKey, {
          queueDepth: queueDepth.toString(),
          activeCount: activeServicesCount.toString(),
          reconciledAt: Date.now().toString(),
        })
      } catch (err) {
        logger.warn(
          { error: err, stationId },
          "[RedisQueue] Redis resync failed during reconciliation (non-critical)"
        )
      }
    }

    return {
      stationId,
      stationName: stationProps?.name || "Station Queue",
      totalBays,
      activeServicesCount,
      availableBays,
      queueDepth,
      totalActiveAndWaiting: activeServicesCount + queueDepth,
      averageWashDurationMinutes: avgDuration,
      waitingQueue: waitingItems,
      activeServices: activeItems,
      reconciledWithMongo: true,
    }
  }

  async cleanStaleQueueEntries(stationId: string): Promise<number> {
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const staleDocs = await BookingModel.find({
        stationId,
        status: BookingStatus.CHECKED_IN,
        updatedAt: { $lt: cutoff },
      }).exec()

      if (staleDocs.length === 0) return 0

      let processedCount = 0

      for (const doc of staleDocs) {
        const domainBooking = BookingMapper.toDomain(doc)
        try {
          domainBooking.markNoShow()
        } catch (err) {
          logger.warn(
            { error: err, bookingId: doc._id.toString() },
            "[RedisQueue] Stale booking is no longer eligible for NO_SHOW transition; skipping"
          )
          continue
        }

        const updatedDoc = await BookingModel.findOneAndUpdate(
          { _id: doc._id, status: BookingStatus.CHECKED_IN },
          {
            $set: {
              status: BookingStatus.NO_SHOW,
              noShowAt: domainBooking.noShowAt,
              updatedAt: domainBooking.updatedAt,
            },
          },
          { new: true }
        ).exec()

        if (!updatedDoc) continue

        await this.bookingStatusLogRepository.save(
          new BookingStatusLog({
            id: "",
            bookingId: doc._id.toString(),
            fromStatus: BookingStatus.CHECKED_IN,
            toStatus: BookingStatus.NO_SHOW,
            changedBy: "SYSTEM_BACKGROUND_JOB",
            reason:
              "Auto-marked NO_SHOW: vehicle stayed CHECKED_IN for over 24 hours without progressing to service",
            createdAt: domainBooking.updatedAt,
          })
        )

        await this.updateQueueStatus(BookingMapper.toDomain(updatedDoc))
        processedCount++
      }

      logger.info({ count: processedCount, stationId }, "[RedisQueue] Cleaned stale queue entries")
      return processedCount
    } catch (error) {
      logger.error({ error, stationId }, "[RedisQueue] Failed to clean stale queue entries")
      return 0
    }
  }
}
