import { BookingStatus } from "../../domain/entities/Booking"

export interface AdvanceStatusInput {
  bookingId: string
  targetStatus: BookingStatus
  notes?: string
}
