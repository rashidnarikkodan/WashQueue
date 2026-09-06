import logger from "@/configs/logger.config"
import { Booking } from "@/modules/booking/domain/entities/Booking"
import { SocketServerService } from "@/infrastructure/websocket/socket-server.service"
import {
  IBookingNotificationService,
  NotificationEventType,
} from "../../application/interfaces/booking-notification.interface"
import { NotificationDispatcherService } from "./notification-dispatcher.service"
import { NotificationType } from "../../domain/types/notification.types"

export type { NotificationEventType }

export class BookingNotificationService implements IBookingNotificationService {
  constructor(private readonly dispatcher?: NotificationDispatcherService) {}

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

      // 1. WebSocket Channel Broadcasts
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

      // 2. Persistent In-App Notifications
      if (this.dispatcher) {
        await this.dispatchPersistentNotifications(eventType, booking, metadata)
      }
    } catch (error) {
      logger.error(
        { error, eventType, bookingId: booking.id },
        "[BookingNotification] Failed to send notification or socket event"
      )
    }
  }

  private async dispatchPersistentNotifications(
    eventType: NotificationEventType,
    booking: Booking,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    if (!this.dispatcher) return

    const refNumber = booking.bookingNumber || `WQ-${booking.id.slice(-6).toUpperCase()}`
    const baseData = {
      bookingId: booking.id,
      bookingNumber: refNumber,
      stationId: booking.stationId,
      serviceType: booking.serviceType,
      status: booking.status,
      url: `/bookings/${booking.id}`,
      ...metadata,
    }

    let notifType: NotificationType = "BOOKING"
    let userTitle = ""
    let userMessage = ""
    let stakeholderTitle = ""
    let stakeholderMessage = ""

    switch (eventType) {
      case "BOOKING_CREATED":
      case "BOOKING_CONFIRMED":
      case "PAYMENT_SUCCESS":
        userTitle = `Booking Confirmed (${refNumber})`
        userMessage = `Your ${booking.serviceType || "car wash"} booking at station is confirmed. You can track queue status in real time.`
        stakeholderTitle = `New Booking (${refNumber})`
        stakeholderMessage = `New ${booking.serviceType || "service"} booking reserved for ${booking.slotDate || "scheduled date"} (${booking.slotStartTime || ""}).`
        break

      case "BOOKING_CANCELLED":
        userTitle = `Booking Cancelled (${refNumber})`
        userMessage = `Your booking has been cancelled.${metadata?.refundAmount ? ` Refund of ₹${metadata.refundAmount} has been processed.` : ""}`
        stakeholderTitle = `Booking Cancelled (${refNumber})`
        stakeholderMessage = `Booking ${refNumber} for ${booking.slotDate || "scheduled slot"} was cancelled by customer.`
        break

      case "BOOKING_RESCHEDULED":
        userTitle = `Booking Rescheduled (${refNumber})`
        userMessage = `Your booking was rescheduled to ${booking.slotDate || "new date"} at ${booking.slotStartTime || "new time"}.`
        stakeholderTitle = `Booking Rescheduled (${refNumber})`
        stakeholderMessage = `Customer rescheduled booking ${refNumber} to ${booking.slotDate || "date"} at ${booking.slotStartTime || "time"}.`
        break

      case "CUSTOMER_CHECKED_IN":
      case "CHECKIN_SUCCESS":
        notifType = "QUEUE"
        userTitle = `Checked In Successfully`
        userMessage = `You have arrived and checked in for ${refNumber}. Your queue position is active.`
        stakeholderTitle = `Customer Checked In (${refNumber})`
        stakeholderMessage = `Customer arrived and validated QR for booking ${refNumber}.`
        break

      case "SERVICE_STARTED":
        notifType = "QUEUE"
        userTitle = `Wash Service In Progress`
        userMessage = `Your vehicle service for ${refNumber} has commenced in the wash bay.`
        break

      case "SERVICE_STALLED":
        notifType = "QUEUE"
        userTitle = `Service Delay Alert`
        userMessage = `Wash service for ${refNumber} is temporarily paused (${metadata?.reason || "Bay delay"}). Our team will resume shortly.`
        stakeholderTitle = `Queue Stalled (${refNumber})`
        stakeholderMessage = `Bay stalled for booking ${refNumber}: ${metadata?.reason || "Operational delay"}.`
        break

      case "SERVICE_RESUMED":
        notifType = "QUEUE"
        userTitle = `Wash Service Resumed`
        userMessage = `Wash service for ${refNumber} has resumed in the bay.`
        break

      case "SERVICE_COMPLETED":
      case "READY_FOR_PICKUP":
        notifType = "QUEUE"
        userTitle = `Vehicle Ready for Pickup! 🚗✨`
        userMessage = `Your vehicle wash for ${refNumber} is completed and inspected. Ready for handover.`
        break

      case "HANDOVER_COMPLETED":
      case "BOOKING_COMPLETED":
        notifType = "QUEUE"
        userTitle = `Vehicle Handover Completed`
        userMessage = `Thank you for choosing WashQueue! Hope you enjoyed our service.`
        stakeholderTitle = `Service Completed (${refNumber})`
        stakeholderMessage = `Vehicle handover completed successfully for booking ${refNumber}.`
        break

      case "BOOKING_NO_SHOW":
        notifType = "QUEUE"
        userTitle = `Booking Marked as No-Show`
        userMessage = `Check-in window for booking ${refNumber} expired without check-in.`
        stakeholderTitle = `No-Show Recorded (${refNumber})`
        stakeholderMessage = `Customer did not check in for booking ${refNumber}.`
        break

      case "REFUND_COMPLETED":
      case "REFUND_PROCESSED":
        notifType = "PAYMENT"
        userTitle = `Refund Credited (₹${metadata?.refundAmount || metadata?.amount || booking.totalPrice})`
        userMessage = `Refund of ₹${metadata?.refundAmount || metadata?.amount || booking.totalPrice} has been credited to your wallet for booking ${refNumber}.`
        break

      default:
        break
    }

    // Dispatch to Customer
    if (userTitle && booking.userId) {
      await this.dispatcher.dispatch({
        recipientId: booking.userId,
        type: notifType,
        title: userTitle,
        message: userMessage,
        data: baseData,
        actionType: "NAVIGATE",
      })
    }

    // Dispatch to Stakeholders (Owner & Station Managers)
    if (stakeholderTitle && booking.stationId) {
      await this.dispatcher.dispatchToStationStakeholders({
        stationId: booking.stationId,
        notifyOwner: true,
        notifyManagers: true,
        defaultPayload: {
          type: notifType,
          title: stakeholderTitle,
          message: stakeholderMessage,
          data: {
            ...baseData,
            url: `/owner/bookings/${booking.id}`,
          },
          actionType: "NAVIGATE",
        },
      })
    }
  }
}
