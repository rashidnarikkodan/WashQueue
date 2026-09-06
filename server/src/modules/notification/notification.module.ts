import { BookingNotificationService } from "./infrastructure/services/booking-notification.service"

export const bookingNotificationService = new BookingNotificationService()

export type {
  IBookingNotificationService,
  NotificationEventType,
} from "./application/interfaces/booking-notification.interface"
