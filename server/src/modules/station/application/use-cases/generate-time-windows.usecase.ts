import { IStationRepository } from "../../domain/repositories/station.repository"
import { ISlotConfigRepository } from "../../domain/repositories/slot-config.repository"
import { ITimeWindowRepository } from "../../domain/repositories/time-window.repository"
import { TimeWindowGenerationService } from "../../domain/services/TimeWindowGenerationService"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { SlotConfig } from "../../domain/entities/SlotConfig"
import { TimeWindowInstance } from "../../domain/entities/TimeWindowInstance"
import { IGenerateTimeWindowsUseCase } from "../interfaces/station-usecases.interface"

export class GenerateTimeWindowsUseCase implements IGenerateTimeWindowsUseCase {
  constructor(
    private stationRepository: IStationRepository,
    private slotConfigRepository: ISlotConfigRepository,
    private timeWindowRepository: ITimeWindowRepository,
    private timeWindowGenerationService: TimeWindowGenerationService
  ) {}

  async execute(
    stationId: string,
    forceRegenerate: boolean = false
  ): Promise<TimeWindowInstance[]> {
    const station = await this.stationRepository.findById(stationId)
    if (!station) {
      throw new AppError("Station not found", HTTP_STATUS.NOT_FOUND)
    }

    let slotConfig = await this.slotConfigRepository.findByStationId(stationId)
    if (!slotConfig) {
      const embeddedConfig = station.getProps().slotConfig
      if (embeddedConfig) {
        slotConfig = new SlotConfig({
          id: "",
          stationId,
          windowDurationMins: embeddedConfig.windowDurationMins || 30,
          capacityPerWindow: embeddedConfig.capacityPerWindow || 2,
          walkInReservedSlots: embeddedConfig.walkInReservedSlots || 0,
          maxAdvanceBookingDays: embeddedConfig.maxAdvanceBookingDays || 7,
          allowWalkIns: embeddedConfig.allowWalkIns ?? true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      } else {
        return []
      }
    }

    const today = new Date()
    const endDate = new Date(today)
    endDate.setDate(today.getDate() + slotConfig.maxAdvanceBookingDays)

    const startDateStr = this.formatDateISO(today)
    const endDateStr = this.formatDateISO(endDate)

    if (forceRegenerate) {
      await this.timeWindowRepository.deleteUnbookedFutureWindows(stationId, today)
    }

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
      await this.timeWindowRepository.saveMany(candidateWindows)
    }

    return this.timeWindowRepository.findByStationIdAndDateRange(
      stationId,
      startDateStr,
      endDateStr
    )
  }

  private formatDateISO(d: Date): string {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }
}
