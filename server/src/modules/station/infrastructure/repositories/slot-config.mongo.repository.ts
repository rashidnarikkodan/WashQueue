import { ISlotConfigRepository } from "../../domain/repositories/slot-config.repository"
import { SlotConfig } from "../../domain/entities/SlotConfig"
import { SlotConfigModel } from "../models/slot-config.model"
import { SlotConfigMapper } from "../mappers/slot-config.mapper"
import { Types } from "mongoose"

export class SlotConfigMongoRepository implements ISlotConfigRepository {
  async findByStationId(stationId: string): Promise<SlotConfig | null> {
    if (!Types.ObjectId.isValid(stationId)) return null
    const doc = await SlotConfigModel.findOne({ stationId: new Types.ObjectId(stationId) })
    if (!doc) return null
    return SlotConfigMapper.toDomain(doc)
  }

  async save(slotConfig: SlotConfig): Promise<SlotConfig> {
    const raw = SlotConfigMapper.toPersistence(slotConfig)

    const updated = await SlotConfigModel.findOneAndUpdate(
      { stationId: raw.stationId },
      { $set: raw },
      { upsert: true, new: true }
    )

    return SlotConfigMapper.toDomain(updated)
  }

  async deleteByStationId(stationId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(stationId)) return false
    const res = await SlotConfigModel.deleteOne({ stationId: new Types.ObjectId(stationId) })
    return res.deletedCount > 0
  }
}
