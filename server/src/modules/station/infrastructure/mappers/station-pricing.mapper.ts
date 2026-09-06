import { Types } from "mongoose"
import { StationPricing, StationPricingProps } from "../../domain/entities/StationPricing"
import { IStationPricing } from "../models/station-pricing.model"

export class StationPricingMapper {
  static toDomain(raw: IStationPricing): StationPricing {
    const props: StationPricingProps = {
      id: raw._id.toString(),
      stationId: raw.stationId.toString(),
      vehicleClassId: raw.vehicleClassId.toString(),
      halfWashPrice: raw.halfWashPrice,
      fullWashPrice: raw.fullWashPrice,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
    return new StationPricing(props)
  }

  static toPartialPersistence(data: {
    stationId?: string
    vehicleClassId?: string
    halfWashPrice?: number
    fullWashPrice?: number
    isActive?: boolean
  }): Partial<IStationPricing> {
    const raw: Partial<IStationPricing> = {}

    if (data.stationId !== undefined) {
      raw.stationId = new Types.ObjectId(data.stationId)
    }
    if (data.vehicleClassId !== undefined) {
      raw.vehicleClassId = new Types.ObjectId(data.vehicleClassId)
    }
    if (data.halfWashPrice !== undefined) {
      raw.halfWashPrice = data.halfWashPrice
    }
    if (data.fullWashPrice !== undefined) {
      raw.fullWashPrice = data.fullWashPrice
    }
    if (data.isActive !== undefined) {
      raw.isActive = data.isActive
    }

    return raw
  }
}
