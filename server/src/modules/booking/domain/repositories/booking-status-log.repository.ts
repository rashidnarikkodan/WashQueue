import { BookingStatusLog } from "../entities/BookingStatusLog"

export interface IBookingStatusLogRepository {
  save(log: BookingStatusLog, session?: unknown): Promise<BookingStatusLog>
  findByBookingId(bookingId: string): Promise<BookingStatusLog[]>
}
