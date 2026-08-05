import { SlotConfig } from "../entities/SlotConfig"

export interface ISlotConfigRepository {
  findByStationId(stationId: string): Promise<SlotConfig | null>
  save(slotConfig: SlotConfig): Promise<SlotConfig>
  deleteByStationId(stationId: string): Promise<boolean>
}
