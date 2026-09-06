import { Booking } from "@/modules/booking/domain/entities/Booking"

export type NotificationEventType =
  | "BOOKING_CREATED"
  | "BOOKING_CONFIRMED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_UPDATED"
  | "CHECKIN_SUCCESS"
  | "CUSTOMER_CHECKED_IN"
  | "BOOKING_CHECKED_IN"
  | "WASH_STARTED"
  | "WASH_COMPLETED"
  | "QUEUE_UPDATED"
  | "QUEUE_POSITION_CHANGED"
  | "SERVICE_STARTED"
  | "SERVICE_STALLED"
  | "SERVICE_RESUMED"
  | "SERVICE_COMPLETED"
  | "POST_INSPECTION_COMPLETED"
  | "HANDOVER_READY"
  | "HANDOVER_COMPLETED"
  | "READY_FOR_PICKUP"
  | "BOOKING_COMPLETED"
  | "BOOKING_NO_SHOW"
  | "BOOKING_CANCELLED"
  | "BOOKING_RESCHEDULED"
  | "BOOKING_STALLED"
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
