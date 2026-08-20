import logger from "@/configs/logger.config"
import { BookingStatus } from "../../domain/entities/Booking"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "../../domain/repositories/booking-status-log.repository"
import { BookingStatusLog } from "../../domain/entities/BookingStatusLog"
import { IBookingQueueService } from "../interfaces/booking-queue.interface"
import { IBookingNotificationService } from "../interfaces/booking-notification.interface"

import { EvaluateAndProcessRefundUseCase } from "./evaluate-and-process-refund.use-case"

export interface ProcessNoShowResult {
  processedCount: number
  noShowBookingIds: string[]
}

export class ProcessNoShowBookingsUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly redisQueueService: IBookingQueueService,
    private readonly notificationService: IBookingNotificationService,
    private readonly evaluateAndProcessRefundUseCase?: EvaluateAndProcessRefundUseCase
  ) {}

  /**
   * Idempotent background processing for past CONFIRMED online bookings beyond allowed grace period.
   * Grace Period Policy: 15 minutes past windowEnd.
   */
  async execute(gracePeriodMinutes: number = 15): Promise<ProcessNoShowResult> {
    const now = new Date()
    const graceCutoff = new Date(now.getTime() - gracePeriodMinutes * 60 * 1000)

    // 1. Query only eligible CONFIRMED bookings past grace cutoff using indexed fields
    const eligibleBookings = await this.bookingRepository.findNoShowCandidates(graceCutoff)

    if (eligibleBookings.length === 0) {
      return { processedCount: 0, noShowBookingIds: [] }
    }

    const processedBookingIds: string[] = []

    for (const booking of eligibleBookings) {
      const bookingId = booking.id

      try {
        booking.markNoShow()
      } catch (err) {
        logger.warn({ error: err, bookingId }, "[NoShowJob] Booking is no longer eligible for NO_SHOW; skipping")
        continue
      }

      // 2. Optimistic-concurrency guard ensures status is still CONFIRMED (Idempotency guarantee)
      const domainBooking = await this.bookingRepository.updateWithStatusGuard(
        booking,
        BookingStatus.CONFIRMED
      )

      if (!domainBooking) {
        // Already processed by another worker or checked in simultaneously
        continue
      }

      processedBookingIds.push(domainBooking.id)

      // 3. Create Audit Log
      const statusLog = new BookingStatusLog({
        id: "",
        bookingId: domainBooking.id,
        fromStatus: BookingStatus.CONFIRMED,
        toStatus: BookingStatus.NO_SHOW,
        changedBy: "SYSTEM_BACKGROUND_JOB",
        reason: `Auto-marked NO_SHOW: Customer missed arrival window (+${gracePeriodMinutes}m grace period after window end elapsed)`,
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
