import { IStationRepository } from "../../domain/repositories/station.repository"
import { ITimeWindowRepository } from "../../domain/repositories/time-window.repository"
import { EnsureBookingHorizonService } from "../services/ensure-booking-horizon.service"
import { AvailableTimeWindowsResponseDTO, TimeWindowDTO } from "../dtos/available-time-windows.dto"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { IGetAvailableTimeWindowsUseCase } from "../interfaces/station-usecases.interface"

export class GetAvailableTimeWindowsUseCase implements IGetAvailableTimeWindowsUseCase {
  constructor(
    private stationRepository: IStationRepository,
    private timeWindowRepository: ITimeWindowRepository,
    private ensureBookingHorizonService: EnsureBookingHorizonService
  ) {}

  async execute(stationId: string, date: string): Promise<AvailableTimeWindowsResponseDTO> {
    const station = await this.stationRepository.findById(stationId)
    if (!station) {
      throw new AppError("Station not found", HTTP_STATUS.NOT_FOUND)
    }

    await this.ensureBookingHorizonService.ensureBookingHorizon(stationId)

    const instances = await this.timeWindowRepository.findByStationIdAndDate(stationId, date)
    const now = new Date()

    const windows: TimeWindowDTO[] = instances.map((w) => {
      w.updateStatusBasedOnTimeAndCapacity(now)

      return {
        windowId: w.id,
        start: w.windowStart.toISOString(),
        end: w.windowEnd.toISOString(),
        bookedCount: w.advanceBookedCount,
        remainingCapacity: w.remainingOnlineCapacity,
        status: w.status,
      }
    })

    return {
      stationId,
      date,
      windows,
    }
  }
}
