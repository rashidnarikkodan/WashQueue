import { ISlotConfigRepository } from "../../domain/repositories/slot-config.repository"
import { SlotConfig } from "../../domain/entities/SlotConfig"
import { StationModel } from "../models/station.model"
import { Types } from "mongoose"

export class SlotConfigMongoRepository implements ISlotConfigRepository {
  async findByStationId(stationId: string): Promise<SlotConfig | null> {
    if (!Types.ObjectId.isValid(stationId)) return null

    const stationDoc = await StationModel.findById(stationId)
    if (!stationDoc || !stationDoc.slotConfig) return null

    return new SlotConfig({
      id: stationDoc._id.toString(),
      stationId: stationDoc._id.toString(),
      windowDurationMins: stationDoc.slotConfig.windowDurationMins || 30,
      capacityPerWindow: stationDoc.slotConfig.capacityPerWindow || 2,
      walkInReservedSlots: stationDoc.slotConfig.walkInReservedSlots || 0,
      maxAdvanceBookingDays: stationDoc.slotConfig.maxAdvanceBookingDays || 7,
      allowWalkIns: stationDoc.slotConfig.allowWalkIns ?? true,
      createdAt: stationDoc.createdAt || new Date(),
      updatedAt: stationDoc.updatedAt || new Date(),
    })
  }

  async save(slotConfig: SlotConfig): Promise<SlotConfig> {
    const raw = {
      windowDurationMins: slotConfig.windowDurationMins,
      capacityPerWindow: slotConfig.capacityPerWindow,
      walkInReservedSlots: slotConfig.walkInReservedSlots,
      maxAdvanceBookingDays: slotConfig.maxAdvanceBookingDays,
      allowWalkIns: slotConfig.allowWalkIns,
    }

    const updated = await StationModel.findByIdAndUpdate(
      slotConfig.stationId,
      { $set: { slotConfig: raw } },
      { new: true }
    )

    if (!updated || !updated.slotConfig) return slotConfig

    return new SlotConfig({
      id: updated._id.toString(),
      stationId: updated._id.toString(),
      windowDurationMins: updated.slotConfig.windowDurationMins || 30,
      capacityPerWindow: updated.slotConfig.capacityPerWindow || 2,
      walkInReservedSlots: updated.slotConfig.walkInReservedSlots || 0,
      maxAdvanceBookingDays: updated.slotConfig.maxAdvanceBookingDays || 7,
      allowWalkIns: updated.slotConfig.allowWalkIns ?? true,
      createdAt: updated.createdAt || new Date(),
      updatedAt: updated.updatedAt || new Date(),
    })
  }

  async deleteByStationId(stationId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(stationId)) return false
    const res = await StationModel.findByIdAndUpdate(stationId, {
      $unset: { slotConfig: 1 },
    })
    return !!res
  }
}
