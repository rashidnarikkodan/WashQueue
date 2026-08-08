import { Booking } from "../../domain/entities/Booking"

export interface IBookingQueueService {
  pushToStationQueue(booking: Booking): Promise<void>
  updateQueueStatus(booking: Booking): Promise<void>
}
