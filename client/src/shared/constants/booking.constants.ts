export const BOOKING_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CHECKED_IN: "CHECKED_IN",
  IN_SERVICE: "IN_SERVICE",
  SERVICE_COMPLETED: "SERVICE_COMPLETED",
  AWAITING_HANDOVER: "AWAITING_HANDOVER",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW",
  STALLED: "STALLED",
} as const

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS]
export type BookingStatusType = BookingStatus

export const SERVICE_TYPE = {
  HALF: "HALF",
  FULL: "FULL",
} as const

export type ServiceType = (typeof SERVICE_TYPE)[keyof typeof SERVICE_TYPE]

export const BOOKING = {
  STATUS: BOOKING_STATUS,
  SERVICE_TYPE: SERVICE_TYPE,
} as const
