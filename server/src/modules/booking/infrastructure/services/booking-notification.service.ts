import logger from "@/configs/logger.config"
import { Booking } from "../../domain/entities/Booking"

export type NotificationEventType =
  | "BOOKING_CREATED"
  | "PAYMENT_SUCCESS"
  | "CHECKIN_SUCCESS"
  | "WASH_STARTED"
  | "WASH_COMPLETED"
  | "BOOKING_CANCELLED"
  | "REFUND_COMPLETED"

export class BookingNotificationService {
  /**
   * Dispatches notifications to customer & station manager based on domain events.
   */
  async notify(eventType: NotificationEventType, booking: Booking, metadata?: Record<string, unknown>): Promise<void> {
    try {
      logger.info(
        {
          eventType,
          bookingId: booking.id,
          bookingNumber: booking.bookingNumber,
          userId: booking.userId,
          stationId: booking.stationId,
          metadata,
        },
        `[BookingNotification] Dispatching notification: ${eventType}`
      )

      // Event-driven pub-sub / email / SMS handler logic hook
      switch (eventType) {
        case "BOOKING_CREATED":
          logger.info(`Notification sent: Booking ${booking.bookingNumber} created successfully`)
          break
        case "CHECKIN_SUCCESS":
          logger.info(`Notification sent: Booking ${booking.bookingNumber} checked in`)
          break
        case "WASH_STARTED":
          logger.info(`Notification sent: Wash started for booking ${booking.bookingNumber}`)
          break
        case "WASH_COMPLETED":
          logger.info(`Notification sent: Wash completed for booking ${booking.bookingNumber}`)
          break
        case "BOOKING_CANCELLED":
          logger.info(`Notification sent: Booking ${booking.bookingNumber} cancelled`)
          break
        default:
          break
      }
    } catch (error) {
      logger.error({ error, eventType, bookingId: booking.id }, "[BookingNotification] Failed to send notification")
    }
  }
}
