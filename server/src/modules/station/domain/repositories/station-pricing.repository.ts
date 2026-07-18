import { ClientSession } from "mongoose"
import { StationPricing } from "../entities/StationPricing"

export interface IStationPricingRepository {
  findByStationId(stationId: string, session?: ClientSession): Promise<StationPricing[]>

  upsertByStationAndClass(
    stationId: string,
    vehicleClassId: string,
    data: { halfWashPrice: number; fullWashPrice: number; isActive?: boolean },
    session?: ClientSession
  ): Promise<StationPricing>

  deleteByStationId(stationId: string, session?: ClientSession): Promise<void>
}
