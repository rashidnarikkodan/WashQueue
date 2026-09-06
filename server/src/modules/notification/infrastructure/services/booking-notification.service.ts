import logger from "@/configs/logger.config"
import { Booking } from "@/modules/booking/domain/entities/Booking"
import { SocketServerService } from "@/infrastructure/websocket/socket-server.service"

import {
  IBookingNotificationService,
  NotificationEventType,
} from "../../application/interfaces/booking-notification.interface"

export type { NotificationEventType }

export class BookingNotificationService implements IBookingNotificationService {
  async notify(
    eventType: NotificationEventType,
    booking: Booking,
    metadata?: Record<string, unknown>
  ): Promise<void> {
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
        `[BookingNotification] Dispatching notification & real-time event: ${eventType}`
      )

      const socketService = SocketServerService.getInstance()
      const payload = {
        eventType,
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        stationId: booking.stationId,
        status: booking.status,
        serviceType: booking.serviceType,
        paymentStatus: booking.paymentStatus,
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
      }

      if (booking.stationId) {
        socketService.emitToStation(booking.stationId, eventType, payload)
        socketService.emitToStation(booking.stationId, "QUEUE_UPDATED", {
          stationId: booking.stationId,
          lastUpdated: new Date().toISOString(),
        })
      }

      if (booking.userId) {
        socketService.emitToUser(booking.userId, eventType, payload)
        socketService.emitToUser(booking.userId, "QUEUE_POSITION_CHANGED", payload)

        if (eventType === "PAYMENT_SUCCESS" || eventType === "PAYMENT_UPDATED") {
          socketService.emitToUser(booking.userId, "PAYMENT_UPDATED", payload)
        }
        if (eventType === "REFUND_COMPLETED" || eventType === "REFUND_PROCESSED") {
          socketService.emitToUser(booking.userId, "REFUND_PROCESSED", payload)
          socketService.emitToUser(booking.userId, "WALLET_UPDATED", payload)
        }
      }

      if (booking.id) {
        socketService.emitToBooking(booking.id, eventType, payload)
      }
    } catch (error) {
      logger.error(
        { error, eventType, bookingId: booking.id },
        "[BookingNotification] Failed to send notification or socket event"
      )
    }
  }
}
