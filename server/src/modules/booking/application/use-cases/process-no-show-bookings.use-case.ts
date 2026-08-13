import logger from "@/configs/logger.config"
import { BookingStatus } from "../../domain/entities/Booking"
import { IBookingStatusLogRepository } from "../../domain/repositories/booking-status-log.repository"
import { BookingStatusLog } from "../../domain/entities/BookingStatusLog"
import { IBookingQueueService } from "../interfaces/booking-queue.interface"
import { IBookingNotificationService } from "../interfaces/booking-notification.interface"
import { BookingModel } from "../../infrastructure/models/booking.model"
import { BookingMapper } from "../../infrastructure/mappers/booking.mapper"

import { EvaluateAndProcessRefundUseCase } from "./evaluate-and-process-refund.use-case"

export interface ProcessNoShowResult {
  processedCount: number
  noShowBookingIds: string[]
}

export class ProcessNoShowBookingsUseCase {
  constructor(
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly redisQueueService: IBookingQueueService,
    private readonly notificationService: IBookingNotificationService,
    private readonly evaluateAndProcessRefundUseCase?: EvaluateAndProcessRefundUseCase
  ) {}

  /**
   * Idempotent background processing for past CONFIRMED bookings beyond allowed grace period.
   * Grace Period Policy: 15 minutes past windowStart.
   */
  async execute(gracePeriodMinutes: number = 15): Promise<ProcessNoShowResult> {
    const now = new Date()
    const graceCutoff = new Date(now.getTime() - gracePeriodMinutes * 60 * 1000)

    // 1. Query only eligible CONFIRMED bookings past grace cutoff using indexed fields
    const eligibleDocs = await BookingModel.find({
      status: BookingStatus.CONFIRMED,
      noShowAt: null,
      "scheduling.windowStart": { $lt: graceCutoff },
    })
      .populate("stationId")
      .populate("vehicleId")
      .populate("userId")
      .exec()

    if (eligibleDocs.length === 0) {
      return { processedCount: 0, noShowBookingIds: [] }
    }

    const processedBookingIds: string[] = []

    for (const doc of eligibleDocs) {
      const bookingId = doc._id.toString()

      // 2. Atomic findOneAndUpdate ensuring status is still CONFIRMED & noShowAt is null (Idempotency guarantee)
      const updatedDoc = await BookingModel.findOneAndUpdate(
        {
          _id: doc._id,
          status: BookingStatus.CONFIRMED,
          noShowAt: null,
        },
        {
          $set: {
            status: BookingStatus.NO_SHOW,
            noShowAt: now,
            updatedAt: now,
          },
        },
        { new: true }
      )
        .populate("stationId")
        .populate("vehicleId")
        .populate("userId")
        .exec()

      if (!updatedDoc) {
        // Already processed by another worker or checked in simultaneously
        continue
      }

      const domainBooking = BookingMapper.toDomain(updatedDoc)
      processedBookingIds.push(domainBooking.id)

      // 3. Create Audit Log
      const statusLog = new BookingStatusLog({
        id: "",
        bookingId: domainBooking.id,
        fromStatus: BookingStatus.CONFIRMED,
        toStatus: BookingStatus.NO_SHOW,
        changedBy: "SYSTEM_BACKGROUND_JOB",
        reason: `Auto-marked NO_SHOW: Customer missed arrival window (+${gracePeriodMinutes}m grace period elapsed)`,
        createdAt: now,
      })
      await this.bookingStatusLogRepository.save(statusLog)

      // 4. Update Redis Operational Queue
      await this.redisQueueService.updateQueueStatus(domainBooking)

      // 5. Notify Customer
      try {
        await this.notificationService.notify("BOOKING_CANCELLED", domainBooking, {
          reason: "Marked NO_SHOW due to missed arrival time window",
        })
      } catch (err) {
        logger.warn({ error: err, bookingId }, "[NoShowJob] Failed to send no-show notification")
      }
    }

    if (processedBookingIds.length > 0) {
      logger.info(
        { count: processedBookingIds.length, bookingIds: processedBookingIds },
        "[NoShowJob] Successfully processed NO_SHOW bookings"
      )
    }

    return {
      processedCount: processedBookingIds.length,
      noShowBookingIds: processedBookingIds,
    }
  }
}
