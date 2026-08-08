import { Booking, BookingStatus } from "../entities/Booking"

export interface FindUserBookingsFilter {
  userId: string
  status?: BookingStatus | BookingStatus[]
  upcomingOnly?: boolean
  historyOnly?: boolean
}

export interface FindBookingsFilter {
  userId?: string
  stationId?: string
  stationIds?: string[]
  providerId?: string
  status?: BookingStatus | BookingStatus[] | string
  search?: string
  startDate?: Date | string
  endDate?: Date | string
  page?: number
  limit?: number
  upcomingOnly?: boolean
  historyOnly?: boolean
}

export interface FindBookingsResult {
  bookings: Booking[]
  total: number
}

export interface IBookingRepository {
  findById(id: string): Promise<Booking | null>
  findByBookingNumber(bookingNumber: string): Promise<Booking | null>
  findByQrTokenHash(qrTokenHash: string): Promise<Booking | null>
  findByUserId(filter: FindUserBookingsFilter): Promise<Booking[]>
  findByStationId(stationId: string, status?: BookingStatus): Promise<Booking[]>
  findBookings(filter: FindBookingsFilter): Promise<FindBookingsResult>
  save(booking: Booking): Promise<Booking>
  update(booking: Booking): Promise<Booking>
}

