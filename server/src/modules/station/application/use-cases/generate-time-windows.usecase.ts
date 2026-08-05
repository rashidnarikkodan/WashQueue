import { IStationRepository } from "../../domain/repositories/station.repository"
import { ISlotConfigRepository } from "../../domain/repositories/slot-config.repository"
import { ITimeWindowRepository } from "../../domain/repositories/time-window.repository"
import { TimeWindowGenerationService } from "../../domain/services/TimeWindowGenerationService"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { TimeWindowInstance } from "../../domain/entities/TimeWindowInstance"

export class GenerateTimeWindowsUseCase {
  constructor(
    private stationRepository: IStationRepository,
    private slotConfigRepository: ISlotConfigRepository,
    private timeWindowRepository: ITimeWindowRepository,
    private timeWindowGenerationService: TimeWindowGenerationService
  ) {}

  async execute(stationId: string): Promise<TimeWindowInstance[]> {
    const station = await this.stationRepository.findById(stationId)
    if (!station) {
      throw new AppError("Station not found", HTTP_STATUS.NOT_FOUND)
    }

    const slotConfig = await this.slotConfigRepository.findByStationId(stationId)
    if (!slotConfig) {
      return []
    }

    const today = new Date()
    const endDate = new Date(today)
    endDate.setDate(today.getDate() + slotConfig.maxAdvanceBookingDays)

    const startDateStr = this.formatDateISO(today)
    const endDateStr = this.formatDateISO(endDate)

    const existingWindows = await this.timeWindowRepository.findByStationIdAndDateRange(
      stationId,
      startDateStr,
      endDateStr
    )

    const existingStarts = new Set(existingWindows.map((w) => w.windowStart.toISOString()))

    const candidateWindows = this.timeWindowGenerationService.generateWindowsForDateRange(
      station,
      slotConfig,
      today,
      endDate,
      existingStarts
    )

    if (candidateWindows.length > 0) {
      return await this.timeWindowRepository.saveMany(candidateWindows)
    }

    return existingWindows
  }

  private formatDateISO(d: Date): string {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }
}
