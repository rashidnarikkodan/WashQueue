import { IStationRepository } from "../../domain/repositories/station.repository"
import { ISlotConfigRepository } from "../../domain/repositories/slot-config.repository"
import { SlotConfig } from "../../domain/entities/SlotConfig"
import { StationStatus } from "../../domain/entities/Station"
import { ConfigureSlotConfigInput, SlotConfigResponseDTO } from "../dtos/slot-config.dto"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import {
  IConfigureSlotConfigUseCase,
  IGenerateTimeWindowsUseCase,
} from "../interfaces/station-usecases.interface"
import { randomUUID } from "node:crypto"

export class ConfigureSlotConfigUseCase implements IConfigureSlotConfigUseCase {
  constructor(
    private stationRepository: IStationRepository,
    private slotConfigRepository: ISlotConfigRepository,
    private generateTimeWindowsUseCase: IGenerateTimeWindowsUseCase
  ) {}

  async execute(input: ConfigureSlotConfigInput): Promise<SlotConfigResponseDTO> {
    const station = await this.stationRepository.findById(input.stationId)
    if (!station) {
      throw new AppError("Station not found", HTTP_STATUS.NOT_FOUND)
    }

    const existing = await this.slotConfigRepository.findByStationId(input.stationId)
    const now = new Date()

    let updatedConfig: SlotConfig

    if (existing) {
      updatedConfig = new SlotConfig({
        id: existing.id,
        stationId: input.stationId,
        windowDurationMins: input.windowDurationMins,
        capacityPerWindow: input.capacityPerWindow,
        walkInReservedSlots: input.walkInReservedSlots,
        maxAdvanceBookingDays: input.maxAdvanceBookingDays,
        allowWalkIns: input.allowWalkIns,
        createdAt: existing.createdAt,
        updatedAt: now,
      })
    } else {
      updatedConfig = new SlotConfig({
        id: randomUUID(),
        stationId: input.stationId,
        windowDurationMins: input.windowDurationMins,
        capacityPerWindow: input.capacityPerWindow,
        walkInReservedSlots: input.walkInReservedSlots,
        maxAdvanceBookingDays: input.maxAdvanceBookingDays,
        allowWalkIns: input.allowWalkIns,
        createdAt: now,
        updatedAt: now,
      })
    }

    const savedConfig = await this.slotConfigRepository.save(updatedConfig)

    const currentSlotConfig = station.getProps().slotConfig
    const windowDurationChanged =
      currentSlotConfig?.windowDurationMins !== undefined &&
      currentSlotConfig.windowDurationMins !== input.windowDurationMins
    const capacityChanged =
      currentSlotConfig?.capacityPerWindow !== undefined &&
      currentSlotConfig.capacityPerWindow !== input.capacityPerWindow

    if (station.status === StationStatus.ACTIVE && (windowDurationChanged || capacityChanged)) {
      station.updateStatus(StationStatus.PENDING_REVIEW)
    }

    station.updateAvailability({
      operatingHours: station.getProps().operatingHours,
      holidays: station.getProps().holidays,
      slotConfig: {
        bays: station.getProps().slotConfig?.bays || 1,
        windowDurationMins: input.windowDurationMins,
        capacityPerWindow: input.capacityPerWindow,
        walkInReservedSlots: input.walkInReservedSlots,
        maxAdvanceBookingDays: input.maxAdvanceBookingDays,
        allowWalkIns: input.allowWalkIns,
      },
    })
    await this.stationRepository.save(station)

    await this.generateTimeWindowsUseCase.execute(input.stationId, true)

    return {
      id: savedConfig.id,
      stationId: savedConfig.stationId,
      windowDurationMins: savedConfig.windowDurationMins,
      capacityPerWindow: savedConfig.capacityPerWindow,
      walkInReservedSlots: savedConfig.walkInReservedSlots,
      maxAdvanceBookingDays: savedConfig.maxAdvanceBookingDays,
      allowWalkIns: savedConfig.allowWalkIns,
      createdAt: savedConfig.createdAt.toISOString(),
      updatedAt: savedConfig.updatedAt.toISOString(),
    }
  }
}
