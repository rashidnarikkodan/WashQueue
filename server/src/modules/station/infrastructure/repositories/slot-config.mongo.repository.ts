import { ISlotConfigRepository } from "../../domain/repositories/slot-config.repository"
import { SlotConfig } from "../../domain/entities/SlotConfig"
import { SlotConfigModel } from "../models/slot-config.model"
import { StationModel } from "../models/station.model"
import { SlotConfigMapper } from "../mappers/slot-config.mapper"
import { Types } from "mongoose"

export class SlotConfigMongoRepository implements ISlotConfigRepository {
  async findByStationId(stationId: string): Promise<SlotConfig | null> {
    if (!Types.ObjectId.isValid(stationId)) return null

    // 1. Primary source: embedded slotConfig in Station document
    const stationDoc = await StationModel.findById(stationId)
    if (stationDoc && stationDoc.slotConfig && stationDoc.slotConfig.windowDurationMins > 0) {
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

    // 2. Fallback check for separate slot_configs collection
    const doc = await SlotConfigModel.findOne({ stationId: new Types.ObjectId(stationId) })
    if (!doc) return null
    return SlotConfigMapper.toDomain(doc)
  }

  async save(slotConfig: SlotConfig): Promise<SlotConfig> {
    const raw = SlotConfigMapper.toPersistence(slotConfig)

    // Sync to embedded slotConfig inside Station document
    await StationModel.findByIdAndUpdate(raw.stationId, {
      $set: {
        "slotConfig.windowDurationMins": raw.windowDurationMins,
        "slotConfig.capacityPerWindow": raw.capacityPerWindow,
        "slotConfig.walkInReservedSlots": raw.walkInReservedSlots,
        "slotConfig.maxAdvanceBookingDays": raw.maxAdvanceBookingDays,
        "slotConfig.allowWalkIns": raw.allowWalkIns,
      },
    })

    // Sync to standalone collection for backwards compatibility
    const updated = await SlotConfigModel.findOneAndUpdate(
      { stationId: raw.stationId },
      { $set: raw },
      { upsert: true, new: true }
    )

    return SlotConfigMapper.toDomain(updated)
  }

  async deleteByStationId(stationId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(stationId)) return false
    await StationModel.findByIdAndUpdate(stationId, {
      $unset: { slotConfig: 1 },
    })
    const res = await SlotConfigModel.deleteOne({ stationId: new Types.ObjectId(stationId) })
    return res.deletedCount > 0
  }
}
