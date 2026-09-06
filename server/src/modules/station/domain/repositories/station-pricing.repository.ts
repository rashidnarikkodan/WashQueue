import { StationPricing } from "../entities/StationPricing"

export interface StationPriceBounds {
  minHalf: number
  maxHalf: number
  minFull: number
  maxFull: number
}

export interface IStationPricingRepository {
  findByStationId(stationId: string, session?: unknown): Promise<StationPricing[]>

  upsertByStationAndClass(
    stationId: string,
    vehicleClassId: string,
    data: { halfWashPrice: number; fullWashPrice: number; isActive?: boolean },
    session?: unknown
  ): Promise<StationPricing>

  deleteByStationId(stationId: string, session?: unknown): Promise<void>

  getActivePriceBounds(): Promise<StationPriceBounds | null>
}
