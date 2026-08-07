import { BookingReservation } from "../entities/BookingReservation"

export interface IBookingReservationRepository {
  save(reservation: BookingReservation): Promise<BookingReservation>
  findById(id: string): Promise<BookingReservation | null>
  findByRazorpayOrderId(orderId: string): Promise<BookingReservation | null>
  findExpiredHeldReservations(now?: Date): Promise<BookingReservation[]>
  updateStatus(
    id: string,
    status: BookingReservation["status"],
    bookingId?: string,
    razorpayPaymentId?: string
  ): Promise<BookingReservation | null>
}
