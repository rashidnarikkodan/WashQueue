import { Booking } from "@/modules/booking/domain/entities/Booking"
import { OperationalStationQueueDTO } from "../dtos/operational-queue.dto"

export interface IBookingQueueService {
  pushToStationQueue(booking: Booking): Promise<void>
  updateQueueStatus(booking: Booking): Promise<void>
  getOperationalQueue(
    stationId: string,
    totalBays: number
  ): Promise<OperationalStationQueueDTO | null>
  reconcileStationQueue(stationId: string): Promise<OperationalStationQueueDTO>
  cleanStaleQueueEntries(stationId: string): Promise<number>
}
