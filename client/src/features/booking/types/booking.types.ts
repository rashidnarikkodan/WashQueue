export type BookingStatus =
  | "ALL"
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "IN_SERVICE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"

export type PaymentStatus = "PENDING" | "PAID" | "REFUNDED" | "FAILED"

export interface Booking {
  id: string
  bookingNumber: string
  stationId: string
  stationName: string
  customerId: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  serviceName: string
  vehicleNumber: string
  vehicleType: string
  slotDate: string
  slotTime: string
  amount: number
  paymentStatus: PaymentStatus
  status: BookingStatus
  notes?: string
  createdAt: string
  updatedAt?: string
}

export interface BookingFilterParams {
  page?: number
  limit?: number
  q?: string
  tab?: BookingStatus
  stationId?: string
  startDate?: string
  endDate?: string
  paymentStatus?: string
}

export type Window = {
  windowId: string
  start: string
  end: string
  bookedCount: number
  remainingCapacity: number
  status: "OPEN" | "FULL" | "CLOSED" | "PAST"
}

export type Calender = {
    minDate: string
    maxDate: string
    dates: { date: string; status: "AVAILABLE" | "FULL" | "HOLIDAY" | "CLOSED" }[]
  } 