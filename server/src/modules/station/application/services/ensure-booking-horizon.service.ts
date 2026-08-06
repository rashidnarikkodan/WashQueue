import { IStationRepository } from "../../domain/repositories/station.repository"
import { ISlotConfigRepository } from "../../domain/repositories/slot-config.repository"
import { ITimeWindowRepository } from "../../domain/repositories/time-window.repository"
import { TimeWindowGenerationService } from "../../domain/services/TimeWindowGenerationService"
import { SlotConfig } from "../../domain/entities/SlotConfig"
import logger from "@/configs/logger.config"


export class EnsureBookingHorizonService {
  constructor(
    private readonly stationRepository: IStationRepository,
    private readonly slotConfigRepository: ISlotConfigRepository,
    private readonly timeWindowRepository: ITimeWindowRepository,
    private readonly generationService: TimeWindowGenerationService
  ) {}

  async ensureBookingHorizon(stationId: string): Promise<void> {
    const station = await this.stationRepository.findById(stationId)
    if (!station) return

    let slotConfig = await this.slotConfigRepository.findByStationId(stationId)
    if (!slotConfig) {
      const stationProps = station.getProps()
      const embeddedConfig = stationProps.slotConfig

      const windowDurationMins = embeddedConfig?.windowDurationMins || 30
      const capacityPerWindow = embeddedConfig?.capacityPerWindow || 2
      const walkInReservedSlots = embeddedConfig?.walkInReservedSlots || 0
      const maxAdvanceBookingDays = embeddedConfig?.maxAdvanceBookingDays || 7
      const allowWalkIns = embeddedConfig?.allowWalkIns ?? true

      const now = new Date()
      const newSlotConfig = new SlotConfig({
        id: "",
        stationId,
        windowDurationMins,
        capacityPerWindow,
        walkInReservedSlots,
        maxAdvanceBookingDays,
        allowWalkIns,
        createdAt: now,
        updatedAt: now,
      })

      try {
        slotConfig = await this.slotConfigRepository.save(newSlotConfig)
      } catch {
        slotConfig = newSlotConfig
      }
    }

    const today = this.localMidnight(new Date())
    const requiredEndDate = this.localMidnight(new Date(today))
    requiredEndDate.setDate(today.getDate() + slotConfig.maxAdvanceBookingDays)

    const requiredEndStr = this.generationService.dateToISO(requiredEndDate)

    const latestDateStr = await this.timeWindowRepository.findLatestWindowDateForStation(stationId)

    if (latestDateStr && latestDateStr >= requiredEndStr) {
      return
    }

    let generateFrom: Date
    if (latestDateStr) {
      const [y, m, d] = latestDateStr.split("-").map(Number)
      generateFrom = new Date(y!, m! - 1, d!)
      generateFrom.setDate(generateFrom.getDate() + 1)
    } else {
      generateFrom = this.localMidnight(new Date())
    }

    if (generateFrom > requiredEndDate) return

    logger.debug(
      "[EnsureBookingHorizon] station=" + stationId +
      " generating " + this.generationService.dateToISO(generateFrom) +
      " to " + requiredEndStr
    )

    const newWindows = this.generationService.generateWindowsForDateRange(
      station,
      slotConfig,
      generateFrom,
      requiredEndDate
    )

    if (newWindows.length > 0) {
      await this.timeWindowRepository.saveMany(newWindows)
    }
  }

  private localMidnight(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  }
}
