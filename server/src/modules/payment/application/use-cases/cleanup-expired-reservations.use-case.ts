import { IBookingReservationRepository } from "../../domain/repositories/booking-reservation.repository"
import { ITimeWindowRepository } from "@/modules/station/domain/repositories/time-window.repository"

import { ICleanupExpiredReservationsUseCase } from "../interfaces/payment-usecases.interface"

export class CleanupExpiredReservationsUseCase implements ICleanupExpiredReservationsUseCase {
  constructor(
    private readonly reservationRepository: IBookingReservationRepository,
    private readonly timeWindowRepository: ITimeWindowRepository
  ) {}

  async execute(now: Date = new Date()): Promise<number> {
    const expiredReservations = await this.reservationRepository.findExpiredHeldReservations(now)
    let releasedCount = 0

    for (const res of expiredReservations) {
      if (res.status === "HELD") {
        res.release()
        await this.reservationRepository.save(res)
        await this.timeWindowRepository.releaseCapacityAtomically(res.timeWindowId)
        releasedCount++
      }
    }

    return releasedCount
  }
}
