import { IStationRepository } from "../../domain/repositories/station.repository"
import { ISlotConfigRepository } from "../../domain/repositories/slot-config.repository"
import { SlotConfigResponseDTO } from "../dtos/slot-config.dto"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"

export class GetSlotConfigUseCase {
  constructor(
    private stationRepository: IStationRepository,
    private slotConfigRepository: ISlotConfigRepository
  ) {}

  async execute(stationId: string): Promise<SlotConfigResponseDTO | null> {
    const station = await this.stationRepository.findById(stationId)
    if (!station) {
      throw new AppError("Station not found", HTTP_STATUS.NOT_FOUND)
    }

    const config = await this.slotConfigRepository.findByStationId(stationId)
    if (!config) {
      // Fallback from station.slotConfig if exists
      const stationSlotConfig = station.getProps().slotConfig
      if (stationSlotConfig) {
        return {
          id: "",
          stationId,
          windowDurationMins: stationSlotConfig.windowDurationMins || 30,
          capacityPerWindow: stationSlotConfig.capacityPerWindow || 1,
          walkInReservedSlots: stationSlotConfig.walkInReservedSlots || 0,
          maxAdvanceBookingDays: stationSlotConfig.maxAdvanceBookingDays || 7,
          allowWalkIns: stationSlotConfig.allowWalkIns ?? true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      }
      return null
    }

    return {
      id: config.id,
      stationId: config.stationId,
      windowDurationMins: config.windowDurationMins,
      capacityPerWindow: config.capacityPerWindow,
      walkInReservedSlots: config.walkInReservedSlots,
      maxAdvanceBookingDays: config.maxAdvanceBookingDays,
      allowWalkIns: config.allowWalkIns,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    }
  }
}
