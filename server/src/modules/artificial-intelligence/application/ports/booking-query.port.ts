export interface BookingSummary {
  id: string
  bookingNumber: string
  status: string
  stationName?: string
  scheduledStart?: Date
  scheduledEnd?: Date
  vehicleInfo?: string
  serviceType: string
  paymentStatus: string
  depositAmount: number
  totalPrice?: number
}

export interface IBookingQueryPort {
  getUserBookings(userId: string, limit?: number): Promise<BookingSummary[]>
  getBookingByNumber(bookingNumber: string, userId: string): Promise<BookingSummary | null>
}
