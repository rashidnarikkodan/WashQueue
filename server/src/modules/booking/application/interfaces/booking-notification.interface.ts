import { Booking } from "../../domain/entities/Booking"

export type NotificationEventType =
  | "BOOKING_CREATED"
  | "PAYMENT_SUCCESS"
  | "CHECKIN_SUCCESS"
  | "WASH_STARTED"
  | "WASH_COMPLETED"
  | "BOOKING_CHECKED_IN"
  | "QUEUE_UPDATED"
  | "QUEUE_POSITION_CHANGED"
  | "SERVICE_STARTED"
  | "SERVICE_COMPLETED"
  | "POST_INSPECTION_COMPLETED"
  | "HANDOVER_READY"
  | "BOOKING_COMPLETED"
  | "BOOKING_NO_SHOW"
  | "BOOKING_CANCELLED"
  | "BOOKING_RESCHEDULED"
  | "BOOKING_STALLED"
  | "PAYMENT_UPDATED"
  | "REFUND_PROCESSED"
  | "WALLET_UPDATED"
  | "REFUND_COMPLETED"

export interface IBookingNotificationService {
  notify(
    eventType: NotificationEventType,
    booking: Booking,
    metadata?: Record<string, unknown>
  ): Promise<void>
}
