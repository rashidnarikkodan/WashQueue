import { IProcessNoShowBookingsUseCase } from "../interfaces/queue-usecases.interface"
import logger from "@/configs/logger.config"
import { BookingStatus } from "@/modules/booking/domain/entities/Booking"
import { IBookingRepository } from "@/modules/booking/domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "@/modules/booking/domain/repositories/booking-status-log.repository"
import { BookingStatusLog } from "@/modules/booking/domain/entities/BookingStatusLog"
import { IBookingQueueService } from "../interfaces/booking-queue.interface"
import { IBookingNotificationService } from "@/modules/notification/notification.module"
export interface ProcessNoShowResult {
  processedCount: number
  noShowBookingIds: string[]
}

export class ProcessNoShowBookingsUseCase implements IProcessNoShowBookingsUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly redisQueueService: IBookingQueueService,
    private readonly notificationService: IBookingNotificationService,
  ) {}

  async execute(gracePeriodMinutes: number = 15): Promise<ProcessNoShowResult> {
    const now = new Date()
    const graceCutoff = new Date(now.getTime() - gracePeriodMinutes * 60 * 1000)

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

      const domainBooking = await this.bookingRepository.updateWithStatusGuard(
        booking,
        BookingStatus.CONFIRMED
      )

      if (!domainBooking) {
        continue
      }

      processedBookingIds.push(domainBooking.id)

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

      await this.redisQueueService.updateQueueStatus(domainBooking)

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
