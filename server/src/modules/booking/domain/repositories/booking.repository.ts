import { Booking, BookingStatus } from "../entities/Booking"

export interface FindUserBookingsFilter {
  userId: string
  status?: BookingStatus | BookingStatus[]
  upcomingOnly?: boolean
  historyOnly?: boolean
}

export interface IBookingRepository {
  findById(id: string): Promise<Booking | null>
  findByBookingNumber(bookingNumber: string): Promise<Booking | null>
  findByQrTokenHash(qrTokenHash: string): Promise<Booking | null>
  findByUserId(filter: FindUserBookingsFilter): Promise<Booking[]>
  findByStationId(stationId: string, status?: BookingStatus): Promise<Booking[]>
  save(booking: Booking): Promise<Booking>
  update(booking: Booking): Promise<Booking>
}
