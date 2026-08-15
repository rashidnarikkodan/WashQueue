import redis from "@/infrastructure/cache/redis.client"
import logger from "@/configs/logger.config"
import { Booking, BookingStatus } from "../../domain/entities/Booking"
import { IBookingQueueService } from "../../application/interfaces/booking-queue.interface"
import { OperationalQueueItemDTO, OperationalStationQueueDTO } from "../../application/dtos/operational-queue.dto"
import { BookingModel } from "../models/booking.model"
import { StationModel } from "@/modules/station/infrastructure/models/station.model"
import { BookingMapper } from "../mappers/booking.mapper"

export class BookingRedisQueueService implements IBookingQueueService {
  /**
   * Deterministic queue ordering score computation:
   * For Scheduled Bookings: min(windowStart, checkedInAt) timestamp
   * For Walk-In Bookings: checkedInAt timestamp
   */
  private computeOrderScore(booking: Booking): number {
    const checkedInTs = booking.checkedInAt ? new Date(booking.checkedInAt).getTime() : Date.now()
    if (!booking.isWalkIn && booking.scheduling && booking.scheduling.windowStart) {
      const windowStartTs = new Date(booking.scheduling.windowStart).getTime()
      return Math.min(windowStartTs, checkedInTs)
    }
    return checkedInTs
  }

  /**
   * Pushes checked-in booking into the Redis station queue cleanly.
   */
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

      // 1. Add to sorted waiting set (score = deterministic score)
      await redis.zadd(queueKey, score, bookingId)

      // 2. Ensure removed from active set if re-queueing
      await redis.srem(activeKey, bookingId)

      // 3. Store Redis Hash metadata
      await redis.hset(bookingKey, {
        bookingId,
        bookingNumber: booking.bookingNumber,
        stationId,
        status: booking.status,
        serviceType: booking.serviceType,
        isWalkIn: booking.isWalkIn ? "true" : "false",
        checkedInAt: (booking.checkedInAt ? new Date(booking.checkedInAt).getTime() : now).toString(),
        windowStart: booking.scheduling?.windowStart ? new Date(booking.scheduling.windowStart).toISOString() : "",
        windowEnd: booking.scheduling?.windowEnd ? new Date(booking.scheduling.windowEnd).toISOString() : "",
      })

      // 4. Update station metadata
      const queueDepth = await redis.zcard(queueKey)
      const activeCount = await redis.scard(activeKey)
      await redis.hset(metaKey, {
        queueDepth: queueDepth.toString(),
        activeCount: activeCount.toString(),
        updatedAt: now.toString(),
      })

      logger.info({ bookingId, stationId, score }, "[RedisQueue] Booking pushed to waiting queue")
    } catch (error) {
      logger.error({ error, bookingId: booking.id }, "[RedisQueue] Redis failure during pushToStationQueue")
    }
  }

  /**
   * Updates Redis state when booking status changes (IN_SERVICE, SERVICE_COMPLETED, COMPLETED, CANCELLED, NO_SHOW).
   */
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
        // Vehicle enters active bay: remove from waiting set, add to active set
        await redis.zrem(queueKey, bookingId)
        await redis.sadd(activeKey, bookingId)
        await redis.hset(bookingKey, {
          status: booking.status,
          serviceStartedAt: (booking.serviceStartedAt ? new Date(booking.serviceStartedAt).getTime() : now).toString(),
        })
      } else if ([BookingStatus.SERVICE_COMPLETED, BookingStatus.AWAITING_HANDOVER].includes(booking.status)) {
        // Service finished: update status hash (remains in active set until final handover/completion)
        await redis.hset(bookingKey, "status", booking.status)
      } else if ([BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.NO_SHOW].includes(booking.status)) {
        // Terminal state: remove from waiting set, active set, and delete hash
        await redis.zrem(queueKey, bookingId)
        await redis.srem(activeKey, bookingId)
        await redis.del(bookingKey)
      } else {
        await redis.hset(bookingKey, "status", booking.status)
      }

      // Refresh meta counters
      const queueDepth = await redis.zcard(queueKey)
      const activeCount = await redis.scard(activeKey)
      await redis.hset(metaKey, {
        queueDepth: queueDepth.toString(),
        activeCount: activeCount.toString(),
        updatedAt: now.toString(),
      })

      logger.info({ bookingId, status: booking.status }, "[RedisQueue] Updated booking queue status in Redis")
    } catch (error) {
      logger.error({ error, bookingId: booking.id }, "[RedisQueue] Redis failure during updateQueueStatus")
    }
  }

  /**
   * Fetches operational queue from Redis, or triggers MongoDB reconciliation if cold/corrupted.
   */
  async getOperationalQueue(stationId: string, totalBays: number): Promise<OperationalStationQueueDTO | null> {
    try {
      const queueKey = `queue:station:${stationId}:waiting`
      const activeKey = `queue:station:${stationId}:active`

      const exists = await redis.exists(queueKey)
      if (!exists) {
        // Cold start or missing Redis key -> compute from Mongo AND (re)persist the
        // ordering keys, since nothing is maintaining them yet.
        return await this.reconcileStationQueue(stationId, { syncRedis: true })
      }

      // Fetch waiting booking IDs ordered deterministically by score
      const waitingBookingIds = await redis.zrange(queueKey, 0, -1)
      const activeBookingIds = await redis.smembers(activeKey)

      const totalActiveAndWaiting = waitingBookingIds.length + activeBookingIds.length
      if (totalActiveAndWaiting === 0) {
        // Empty queue
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

      // Redis already holds a valid, incrementally-maintained ordering (kept in sync by
      // pushToStationQueue/updateQueueStatus/cleanStaleQueueEntries on state transitions).
      // Recompute the live position/wait-time DTOs from Mongo (they're inherently
      // time-dependent), but don't blow away and rewrite the Redis keys on every read —
      // that turned every read into a write storm with no caching benefit and raced with
      // concurrent readers doing the same delete+rebuild.
      return await this.reconcileStationQueue(stationId, { syncRedis: false })
    } catch (error) {
      logger.error({ error, stationId }, "[RedisQueue] Failed to read queue from Redis; falling back to MongoDB reconciliation")
      return await this.reconcileStationQueue(stationId, { syncRedis: true })
    }
  }

  /**
   * Reconciles Redis operational queue against MongoDB persistent source of truth.
   */
  private computeDynamicServiceDurationMinutes(booking: Booking, historicalAvgMinutes?: number): number {
    const baseMinutes = booking.serviceType === "FULL" ? 40 : 20
    const extraServicesMinutes = (booking.extraServices?.length || 0) * 5

    // Vehicle Class / Model Duration Modifier
    const modelLower = (booking.vehicleDetails?.model || "").toLowerCase()
    let classModifier = 0
    if (modelLower.includes("suv") || modelLower.includes("luxury") || modelLower.includes("fortuner") || modelLower.includes("endeavour")) {
      classModifier = 10
    } else if (modelLower.includes("van") || modelLower.includes("heavy") || modelLower.includes("truck")) {
      classModifier = 15
    }

    const calculated = baseMinutes + extraServicesMinutes + classModifier

    // Blend with historical station average if available (50/50 weighting)
    if (historicalAvgMinutes && historicalAvgMinutes >= 10 && historicalAvgMinutes <= 120) {
      return Math.round((calculated + historicalAvgMinutes) / 2)
    }
    return calculated
  }

  /**
   * Reconciles Redis operational queue against MongoDB persistent source of truth.
   */
  async reconcileStationQueue(
    stationId: string,
    options: { syncRedis?: boolean } = {}
  ): Promise<OperationalStationQueueDTO> {
    const syncRedis = options.syncRedis ?? true
    const queueKey = `queue:station:${stationId}:waiting`
    const activeKey = `queue:station:${stationId}:active`
    const metaKey = `queue:station:${stationId}:meta`

    // 1. Fetch Station configuration for total bays
    let totalBays = 1
    const stationDoc = await StationModel.findById(stationId).exec()
    if (stationDoc && stationDoc.slotConfig && typeof stationDoc.slotConfig.bays === "number") {
      totalBays = Math.max(1, stationDoc.slotConfig.bays)
    }

    // Query historical completed services for actual average duration per station
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
    } catch {
      // Fall back if history query fails
    }

    // 2. Fetch active operational bookings from MongoDB
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

    // 3. Separate Active (IN_SERVICE / COMPLETED_SERVICE / HANDOVER) vs Waiting (CHECKED_IN)
    const activeServicesList: Booking[] = []
    const waitingList: Booking[] = []

    for (const b of domainBookings) {
      if (b.status === BookingStatus.CHECKED_IN) {
        waitingList.push(b)
      } else {
        activeServicesList.push(b)
      }
    }

    // 4. Sort waitingList deterministically by score
    waitingList.sort((a, b) => this.computeOrderScore(a) - this.computeOrderScore(b))

    const activeServicesCount = activeServicesList.length
    const availableBays = Math.max(0, totalBays - activeServicesCount)
    const queueDepth = waitingList.length
    const avgDuration = historicalAvgMinutes || 25 // Average wash duration in minutes

    // 5. Build Authoritative Server-Calculated DTOs
    const activeItems: OperationalQueueItemDTO[] = activeServicesList.map((b, idx) => {
      const customerName = b.customerDetails?.name || b.walkInCustomer?.name || (b.isWalkIn ? "Walk-In Customer" : "Customer")
      const phone = b.customerDetails?.phone || b.walkInCustomer?.phone || ""
      const reg = b.vehicleDetails?.registrationNumber || b.walkInVehicle?.registrationNumber || "N/A"

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
        windowStart: b.scheduling?.windowStart ? new Date(b.scheduling.windowStart).toISOString() : undefined,
        windowEnd: b.scheduling?.windowEnd ? new Date(b.scheduling.windowEnd).toISOString() : undefined,
        checkedInAt: b.checkedInAt ? new Date(b.checkedInAt).toISOString() : undefined,
        serviceStartedAt: b.serviceStartedAt ? new Date(b.serviceStartedAt).toISOString() : undefined,
        completedAt: b.completedAt ? new Date(b.completedAt).toISOString() : undefined,
        queuePosition: 0, // 0 for active in bay
        isBayActive: true,
        assignedBayNumber: (idx % totalBays) + 1,
        estimatedWaitMinutes: 0,
      }
    })

    // Calculate remaining minutes on active bays & simulate multi-bay queue timeline
    const nowMs = Date.now()
    const bayFinishMinutes: number[] = []

    for (let i = 0; i < totalBays; i++) {
      const activeB = activeServicesList[i]
      if (activeB) {
        const duration = this.computeDynamicServiceDurationMinutes(activeB, historicalAvgMinutes)
        const startMs = activeB.serviceStartedAt ? new Date(activeB.serviceStartedAt).getTime() : nowMs
        const elapsedMinutes = Math.max(0, (nowMs - startMs) / (1000 * 60))
        const remainingMinutes = Math.max(1, Math.round(duration - elapsedMinutes))
        bayFinishMinutes.push(remainingMinutes)
      } else {
        bayFinishMinutes.push(0) // Empty bay immediately available
      }
    }

    const waitingItems: OperationalQueueItemDTO[] = waitingList.map((b, idx) => {
      const position = idx + 1 // 1-indexed queue position
      const customerName = b.customerDetails?.name || b.walkInCustomer?.name || (b.isWalkIn ? "Walk-In Customer" : "Customer")
      const phone = b.customerDetails?.phone || b.walkInCustomer?.phone || ""
      const reg = b.vehicleDetails?.registrationNumber || b.walkInVehicle?.registrationNumber || "N/A"

      // Sort bays to find earliest available bay for vehicle
      bayFinishMinutes.sort((x, y) => x - y)
      const estimatedWaitMinutes = bayFinishMinutes[0] ?? 0
      const estimatedServiceStart = new Date(nowMs + estimatedWaitMinutes * 60 * 1000).toISOString()

      // Update earliest bay's finish timeline with this vehicle's service duration
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
        windowStart: b.scheduling?.windowStart ? new Date(b.scheduling.windowStart).toISOString() : undefined,
        windowEnd: b.scheduling?.windowEnd ? new Date(b.scheduling.windowEnd).toISOString() : undefined,
        checkedInAt: b.checkedInAt ? new Date(b.checkedInAt).toISOString() : undefined,
        queuePosition: position,
        isBayActive: false,
        estimatedWaitMinutes,
        estimatedServiceStart,
      }
    })

    // 6. Resynchronize Redis ordering keys — only when actually needed (cold start /
    // explicit forced resync), not on every read; see getOperationalQueue.
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
        logger.warn({ error: err, stationId }, "[RedisQueue] Redis resync failed during reconciliation (non-critical)")
      }
    }

    return {
      stationId,
      stationName: stationDoc?.name || "Station Queue",
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

  /**
   * Cleans stale queue entries (>24 hours checked-in without progression).
   */
  async cleanStaleQueueEntries(stationId: string): Promise<number> {
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const staleDocs = await BookingModel.find({
        stationId,
        status: BookingStatus.CHECKED_IN,
        updatedAt: { $lt: cutoff },
      }).exec()

      if (staleDocs.length === 0) return 0

      for (const doc of staleDocs) {
        doc.status = BookingStatus.NO_SHOW
        doc.updatedAt = new Date()
        await doc.save()
        await this.updateQueueStatus(BookingMapper.toDomain(doc))
      }

      logger.info({ count: staleDocs.length, stationId }, "[RedisQueue] Cleaned stale queue entries")
      return staleDocs.length
    } catch (error) {
      logger.error({ error, stationId }, "[RedisQueue] Failed to clean stale queue entries")
      return 0
    }
  }
}
