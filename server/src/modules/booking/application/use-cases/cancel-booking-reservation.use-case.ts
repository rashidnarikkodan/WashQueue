import { IBookingReservationRepository } from "../../domain/repositories/booking-reservation.repository"
import { ITimeWindowRepository } from "@/modules/station/domain/repositories/time-window.repository"

export class CancelBookingReservationUseCase {
  constructor(
    private readonly reservationRepository: IBookingReservationRepository,
    private readonly timeWindowRepository: ITimeWindowRepository
  ) {}

  async execute(reservationId: string, userId: string): Promise<void> {
    const reservation = await this.reservationRepository.findById(reservationId)
    if (!reservation) return

    if (reservation.userId !== userId) return

    if (reservation.status === "HELD") {
      reservation.release()
      await this.reservationRepository.save(reservation)
      await this.timeWindowRepository.releaseCapacityAtomically(reservation.timeWindowId)
    }
  }
}
