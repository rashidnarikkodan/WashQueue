import { StationPricing } from "../entities/StationPricing"

export interface IStationPricingRepository {
  findByStationId(stationId: string, session?: unknown): Promise<StationPricing[]>

  upsertByStationAndClass(
    stationId: string,
    vehicleClassId: string,
    data: { halfWashPrice: number; fullWashPrice: number; isActive?: boolean },
    session?: unknown
  ): Promise<StationPricing>

  deleteByStationId(stationId: string, session?: unknown): Promise<void>
}
