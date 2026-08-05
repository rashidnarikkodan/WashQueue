import { BookingStatusLog } from "../entities/BookingStatusLog"

export interface IBookingStatusLogRepository {
  save(log: BookingStatusLog): Promise<BookingStatusLog>
  findByBookingId(bookingId: string): Promise<BookingStatusLog[]>
}
