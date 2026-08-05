import { IStationRepository } from "../../domain/repositories/station.repository"
import { ISlotConfigRepository } from "../../domain/repositories/slot-config.repository"
import { SlotConfig } from "../../domain/entities/SlotConfig"
import { ConfigureSlotConfigInput, SlotConfigResponseDTO } from "../dtos/slot-config.dto"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { GenerateTimeWindowsUseCase } from "./generate-time-windows.usecase"
import { randomUUID } from "node:crypto"

export class ConfigureSlotConfigUseCase {
  constructor(
    private stationRepository: IStationRepository,
    private slotConfigRepository: ISlotConfigRepository,
    private generateTimeWindowsUseCase: GenerateTimeWindowsUseCase
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

    // Trigger time window generation for configured advance booking days
    await this.generateTimeWindowsUseCase.execute(input.stationId)

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
