import env from "@/configs/env.config"
import logger from "@/configs/logger.config"
import { Booking } from "@/modules/booking/domain/entities/Booking"
import { SocketServerService } from "@/infrastructure/websocket/socket-server.service"
import {
  IBookingNotificationService,
  INotificationDispatcherService,
  NotificationEventType,
} from "../../application/interfaces/notification-services.interface"
import { NotificationType } from "../../domain/types/notification.types"
import { IMailService } from "@/core/application/interfaces/mail.interface"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"

export type { NotificationEventType }

export class BookingNotificationService implements IBookingNotificationService {
  constructor(
    private readonly dispatcher?: INotificationDispatcherService,
    private readonly mailService?: IMailService,
    private readonly userRepository?: IUserRepository,
    private readonly stationRepository?: IStationRepository
  ) {}

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

      // 3. Email Notifications (Confirmation, Payment Receipt, Cancellation/Refund)
      if (this.mailService && this.userRepository) {
        await this.dispatchEmailNotifications(eventType, booking, metadata)
      }
    } catch (error) {
      logger.error(
        { error, eventType, bookingId: booking.id },
        "[BookingNotification] Failed to send notification or socket event"
      )
    }
  }

  private async dispatchEmailNotifications(
    eventType: NotificationEventType,
    booking: Booking,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    if (!this.mailService || !this.userRepository || !booking.userId) return

    try {
      const user = await this.userRepository.findById(booking.userId)
      if (!user || !user.email) return

      let stationName = "Car Wash Station"
      if (this.stationRepository && booking.stationId) {
        const station = await this.stationRepository.findById(booking.stationId)
        if (station && station.name) {
          stationName = station.name
        }
      }

      const customerName = user.name || "Customer"
      const refNumber = booking.bookingNumber || `WQ-${booking.id.slice(-6).toUpperCase()}`
      const slotDate = booking.scheduling?.windowStart
        ? new Date(booking.scheduling.windowStart).toLocaleDateString()
        : new Date().toLocaleDateString()
      const slotStartTime = booking.scheduling?.windowStart
        ? new Date(booking.scheduling.windowStart).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Scheduled Time"
      const totalPrice = booking.pricingSnapshot?.totalPrice ?? 0
      const paymentMethod = booking.paymentMethod || "ONLINE"
      const paymentStatus = booking.paymentStatus || "PENDING"
      const bookingUrl = `${env.CLIENT_URL}/bookings/${booking.id}`

      switch (eventType) {
        case "BOOKING_CREATED":
        case "BOOKING_CONFIRMED": {
          // Send Booking Confirmation Email
          await this.mailService.sendBookingConfirmationEmail(user.email, {
            customerName,
            bookingNumber: refNumber,
            stationName,
            serviceType: booking.serviceType || "Standard Wash",
            scheduledDate: slotDate,
            scheduledTime: slotStartTime,
            totalAmount: totalPrice,
            paymentMethod,
            paymentStatus,
            bookingUrl,
          })

          // If paid online, via wallet, or deposit paid, send payment receipt email
          if (
            booking.paymentStatus === "PAID" ||
            (booking.depositAmount && booking.depositAmount > 0)
          ) {
            const paidAmount =
              booking.paymentStatus === "PAID" ? totalPrice : (booking.depositAmount ?? totalPrice)
            await this.mailService.sendPaymentReceiptEmail(user.email, {
              customerName,
              transactionId: `TXN-${refNumber}`,
              amount: paidAmount,
              paymentMethod,
              paymentStatus: "SUCCESS",
              date: new Date().toLocaleDateString(),
              description: `${booking.serviceType || "Car Wash"} at ${stationName}`,
              bookingNumber: refNumber,
              stationName,
              receiptUrl: bookingUrl,
            })
          }
          break
        }

        case "PAYMENT_SUCCESS":
        case "PAYMENT_UPDATED": {
          if (booking.paymentStatus === "PAID") {
            await this.mailService.sendPaymentReceiptEmail(user.email, {
              customerName,
              transactionId: `TXN-${refNumber}`,
              amount: totalPrice,
              paymentMethod,
              paymentStatus: "SUCCESS",
              date: new Date().toLocaleDateString(),
              description: `Payment for booking #${refNumber}`,
              bookingNumber: refNumber,
              stationName,
              receiptUrl: bookingUrl,
            })
          }
          break
        }

        case "BOOKING_CANCELLED": {
          const refundAmount =
            typeof metadata?.refundAmount === "number"
              ? metadata.refundAmount
              : typeof booking.refundAmount === "number"
                ? booking.refundAmount
                : 0
          const refundMethod = (metadata?.refundType as string) || "WALLET"

          await this.mailService.sendBookingCancellationEmail(user.email, {
            customerName,
            bookingNumber: refNumber,
            stationName,
            serviceType: booking.serviceType,
            scheduledDate: slotDate,
            reason: (metadata?.reason as string) || booking.cancellation?.cancellationReason,
            refundAmount,
            refundMethod,
          })
          break
        }

        case "REFUND_COMPLETED":
        case "REFUND_PROCESSED": {
          const refundAmount =
            typeof metadata?.refundAmount === "number"
              ? metadata.refundAmount
              : typeof metadata?.amount === "number"
                ? metadata.amount
                : typeof booking.refundAmount === "number"
                  ? booking.refundAmount
                  : totalPrice
          const refundMethod = (metadata?.refundType as string) || "WALLET"

          await this.mailService.sendBookingCancellationEmail(user.email, {
            customerName,
            bookingNumber: refNumber,
            stationName,
            serviceType: booking.serviceType,
            scheduledDate: slotDate,
            reason: (metadata?.reason as string) || "Refund processed to wallet",
            refundAmount,
            refundMethod,
          })
          break
        }

        default:
          break
      }
    } catch (emailErr) {
      logger.error(
        { error: emailErr, eventType, bookingId: booking.id },
        "[BookingNotification] Failed to send email notification"
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
    const slotDate = booking.scheduling?.windowStart
      ? new Date(booking.scheduling.windowStart).toLocaleDateString()
      : undefined
    const slotStartTime = booking.scheduling?.windowStart
      ? new Date(booking.scheduling.windowStart).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : undefined
    const totalPrice = booking.pricingSnapshot?.totalPrice ?? 0

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
        stakeholderMessage = `New ${booking.serviceType || "service"} booking reserved for ${slotDate || "scheduled date"}${slotStartTime ? ` (${slotStartTime})` : ""}.`
        break

      case "BOOKING_CANCELLED":
        userTitle = `Booking Cancelled (${refNumber})`
        userMessage = `Your booking has been cancelled.${metadata?.refundAmount ? ` Refund of ₹${metadata.refundAmount} has been processed.` : ""}`
        stakeholderTitle = `Booking Cancelled (${refNumber})`
        stakeholderMessage = `Booking ${refNumber} for ${slotDate || "scheduled slot"} was cancelled by customer.`
        break

      case "BOOKING_RESCHEDULED":
        userTitle = `Booking Rescheduled (${refNumber})`
        userMessage = `Your booking was rescheduled to ${slotDate || "new date"} at ${slotStartTime || "new time"}.`
        stakeholderTitle = `Booking Rescheduled (${refNumber})`
        stakeholderMessage = `Customer rescheduled booking ${refNumber} to ${slotDate || "date"} at ${slotStartTime || "time"}.`
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
        userTitle = `Refund Credited (₹${metadata?.refundAmount || metadata?.amount || totalPrice})`
        userMessage = `Refund of ₹${metadata?.refundAmount || metadata?.amount || totalPrice} has been credited to your wallet for booking ${refNumber}.`
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
