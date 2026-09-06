import { ClientSession, Types } from "mongoose"
import { StationPricing } from "../../domain/entities/StationPricing"
import {
  IStationPricingRepository,
  StationPriceBounds,
} from "../../domain/repositories/station-pricing.repository"
import { StationPricingModel } from "../models/station-pricing.model"
import { StationPricingMapper } from "../mappers/station-pricing.mapper"

export class StationPricingMongoRepository implements IStationPricingRepository {
  async findByStationId(stationId: string, session?: ClientSession): Promise<StationPricing[]> {
    const docs = await StationPricingModel.find({ stationId: new Types.ObjectId(stationId) })
      .session(session || null)
      .exec()
    return docs.map((doc) => StationPricingMapper.toDomain(doc))
  }

  async upsertByStationAndClass(
    stationId: string,
    vehicleClassId: string,
    data: { halfWashPrice: number; fullWashPrice: number; isActive?: boolean },
    session?: ClientSession
  ): Promise<StationPricing> {
    const query = {
      stationId: new Types.ObjectId(stationId),
      vehicleClassId: new Types.ObjectId(vehicleClassId),
    }
    const update = {
      $set: {
        halfWashPrice: data.halfWashPrice,
        fullWashPrice: data.fullWashPrice,
        isActive: data.isActive ?? true,
      },
    }
    const options = {
      upsert: true,
      returnDocument: "after" as const,
      session,
    }
    const doc = await StationPricingModel.findOneAndUpdate(query, update, options).exec()
    if (!doc) {
      throw new Error("Failed to upsert station pricing")
    }
    return StationPricingMapper.toDomain(doc)
  }

  async deleteByStationId(stationId: string, session?: ClientSession): Promise<void> {
    await StationPricingModel.deleteMany({ stationId: new Types.ObjectId(stationId) })
      .session(session || null)
      .exec()
  }

  async getActivePriceBounds(): Promise<StationPriceBounds | null> {
    const [stats] = await StationPricingModel.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minHalf: { $min: "$halfWashPrice" },
          maxHalf: { $max: "$halfWashPrice" },
          minFull: { $min: "$fullWashPrice" },
          maxFull: { $max: "$fullWashPrice" },
        },
      },
    ]).exec()

    if (!stats) return null

    return {
      minHalf: stats.minHalf,
      maxHalf: stats.maxHalf,
      minFull: stats.minFull,
      maxFull: stats.maxFull,
    }
  }
}
