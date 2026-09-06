import { Booking } from "@/modules/booking/domain/entities/Booking"
import { Notification } from "../../domain/entities/Notification"
import {
  NotificationActionType,
  NotificationChannel,
  NotificationType,
} from "../../domain/types/notification.types"

export interface DispatchNotificationOptions {
  recipientId: string
  senderId?: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown> | string
  channel?: NotificationChannel
  actionType?: NotificationActionType
  expiresAt?: Date
}

export interface DispatchStationStakeholdersOptions {
  stationId: string
  notifyOwner?: boolean
  notifyManagers?: boolean
  ownerPayload?: Partial<Omit<DispatchNotificationOptions, "recipientId">>
  managerPayload?: Partial<Omit<DispatchNotificationOptions, "recipientId">>
  defaultPayload: Omit<DispatchNotificationOptions, "recipientId">
}

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

export interface INotificationDispatcherService {
  dispatch(options: DispatchNotificationOptions): Promise<Notification | null>
  dispatchToUsers(
    recipientIds: string[],
    options: Omit<DispatchNotificationOptions, "recipientId">
  ): Promise<Notification[]>
  dispatchToAdmins(
    options: Omit<DispatchNotificationOptions, "recipientId">
  ): Promise<Notification[]>
  dispatchToStationStakeholders(options: DispatchStationStakeholdersOptions): Promise<void>
}
