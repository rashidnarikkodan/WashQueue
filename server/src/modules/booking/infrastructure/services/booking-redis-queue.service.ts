import redis from "@/infrastructure/cache/redis.client"
import logger from "@/configs/logger.config"
import { Booking } from "../../domain/entities/Booking"

export class BookingRedisQueueService {
  /**
   * Pushes checked-in booking into the station queue in Redis.
   */
  async pushToStationQueue(booking: Booking): Promise<void> {
    try {
      const stationId = booking.stationId
      const bookingId = booking.id
      const queueKey = `queue:${stationId}`
      const bookingKey = `queue:booking:${bookingId}`
      const stationLiveKey = `station:live:${stationId}`

      const timestamp = Date.now()

      // 1. Add to station queue sorted set (score = timestamp of check-in)
      await redis.zadd(queueKey, timestamp, bookingId)

      // 2. Set hash metadata for this booking
      await redis.hset(bookingKey, {
        bookingId,
        bookingNumber: booking.bookingNumber,
        stationId,
        status: booking.status,
        serviceType: booking.serviceType,
        checkedInAt: timestamp.toString(),
      })

      // 3. Increment station live queue counter
      await redis.hincrby(stationLiveKey, "queueDepth", 1)

      logger.info({ bookingId, stationId }, "[RedisQueue] Booking added to station queue")
    } catch (error) {
      logger.error({ error, bookingId: booking.id }, "[RedisQueue] Failed to push to Redis queue")
    }
  }

  /**
   * Updates Redis queue progress when status advances or booking is completed/cancelled.
   */
  async updateQueueStatus(booking: Booking): Promise<void> {
    try {
      const stationId = booking.stationId
      const bookingId = booking.id
      const queueKey = `queue:${stationId}`
      const bookingKey = `queue:booking:${bookingId}`
      const stationLiveKey = `station:live:${stationId}`

      await redis.hset(bookingKey, "status", booking.status)

      // If status reaches terminal state (COMPLETED, CANCELLED, NO_SHOW), remove from active queue
      if (["COMPLETED", "CANCELLED", "NO_SHOW"].includes(booking.status)) {
        await redis.zrem(queueKey, bookingId)
        await redis.del(bookingKey)

        const currentDepth = await redis.hget(stationLiveKey, "queueDepth")
        if (currentDepth && parseInt(currentDepth, 10) > 0) {
          await redis.hincrby(stationLiveKey, "queueDepth", -1)
        }

        logger.info(
          { bookingId, status: booking.status },
          "[RedisQueue] Booking removed from active Redis queue"
        )
      }
    } catch (error) {
      logger.error(
        { error, bookingId: booking.id },
        "[RedisQueue] Failed to update Redis queue status"
      )
    }
  }
}
