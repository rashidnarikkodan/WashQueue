import { Booking } from "../../domain/entities/Booking"

export type NotificationEventType =
  | "BOOKING_CREATED"
  | "PAYMENT_SUCCESS"
  | "CHECKIN_SUCCESS"
  | "WASH_STARTED"
  | "WASH_COMPLETED"
  | "BOOKING_CANCELLED"
  | "REFUND_COMPLETED"

export interface IBookingNotificationService {
  notify(
    eventType: NotificationEventType,
    booking: Booking,
    metadata?: Record<string, unknown>
  ): Promise<void>
}
