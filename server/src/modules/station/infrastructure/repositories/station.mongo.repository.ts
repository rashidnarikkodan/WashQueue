import { BaseRepository } from "@/infrastructure/database/repository/base.repository"
import { IStation, StationModel } from "../models/station.model"
import { Station } from "../../domain/entities/Station"
import { IStationRepository, StationFilter, NearbyStationFilter } from "../../domain/repositories/station.repository"
import { StationMapper } from "../mappers/station.mapper"
import { PipelineStage, Types } from "mongoose"

export class StationMongoRepository
  extends BaseRepository<Station, IStation>
  implements IStationRepository
{
  constructor() {
    super(StationModel, new StationMapper())
  }

  async findByOwnerId(ownerId: string): Promise<Station[]> {
    const docs = await this.model
      .find({ ownerId: new Types.ObjectId(ownerId) })
      .sort({ name: 1 })
      .exec()
    return docs.map((doc) => this.mapper.toDomain(doc))
  }

  async findByName(name: string): Promise<Station | null> {
    const doc = await this.model.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } }).exec()
    return doc ? this.mapper.toDomain(doc) : null
  }

  async findAll(filter: StationFilter): Promise<Station[]> {
    const pipeline: PipelineStage[] = []

    // 1. Match Stage
    const matchStage = this.buildMatchStage(filter)
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage })
    }

    // 2. Pricing Lookup & Match
    pipeline.push(...this.buildPricingLookup(filter))

    // 3. Extra Services Lookup & Match
    pipeline.push(...this.buildExtraServiceLookup(filter))

    // 4. Sort Stage
    pipeline.push(this.buildSortStage(filter.sortBy, filter.sortOrder))

    // 5. Pagination
    pipeline.push(...this.buildPagination(filter.page, filter.limit))

    const docs = await this.model.aggregate(pipeline).exec()
    return docs.map((doc) => this.mapper.toDomain(doc as IStation))
  }

  async findNearby(filter: NearbyStationFilter): Promise<Station[]> {
    const pipeline: PipelineStage[] = []

    // 1. GeoNear Stage (Must be first)
    pipeline.push(this.buildNearbyPipeline(filter))

    // 2. Additional Match Stage (e.g., minimumRating, status=ACTIVE could be added here if needed)
    const matchStage: Record<string, unknown> = {}
    if (filter.minimumRating !== undefined) {
      matchStage.rating = { $gte: filter.minimumRating }
    }
    // We can default to only showing active stations for nearby search
    matchStage.isActive = true
    
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage })
    }

    // 3. Pricing Lookup & Match
    pipeline.push(...this.buildPricingLookup(filter))

    // 4. Extra Services Lookup & Match
    pipeline.push(...this.buildExtraServiceLookup(filter))

    // 5. Pagination (Sorting is implicitly done by $geoNear distance)
    pipeline.push(...this.buildPagination(filter.page, filter.limit))

    const docs = await this.model.aggregate(pipeline).exec()
    return docs.map((doc) => this.mapper.toDomain(doc as IStation))
  }

  private buildMatchStage(filter: StationFilter): Record<string, unknown> {
    const match: Record<string, unknown> = {}

    if (filter.ownerId) {
      match.ownerId = new Types.ObjectId(filter.ownerId)
    }
    if (filter.status) {
      match.status = filter.status
    }
    if (filter.city) {
      match["address.city"] = filter.city
    }
    if (filter.state) {
      match["address.state"] = filter.state
    }
    if (filter.country) {
      match["address.country"] = filter.country
    }
    if (filter.isActive !== undefined) {
      match.isActive = filter.isActive
    }
    if (filter.minimumRating !== undefined) {
      match.rating = { $gte: filter.minimumRating }
    }
    if (filter.search) {
      match.$or = [
        { name: { $regex: filter.search, $options: "i" } },
        { description: { $regex: filter.search, $options: "i" } },
      ]
    }

    return match
  }

  private buildPricingLookup(filter: StationFilter | NearbyStationFilter): PipelineStage[] {
    const pipeline: PipelineStage[] = []
    
    const hasPricingFilter = 
      filter.vehicleClassId || 
      filter.minHalfWashPrice !== undefined || 
      filter.maxHalfWashPrice !== undefined ||
      filter.minFullWashPrice !== undefined ||
      filter.maxFullWashPrice !== undefined

    if (hasPricingFilter) {
      const pricingMatch: Record<string, unknown> = {}
      
      if (filter.vehicleClassId) {
        pricingMatch["pricing.vehicleClassId"] = new Types.ObjectId(filter.vehicleClassId)
      }
      
      if (filter.minHalfWashPrice !== undefined || filter.maxHalfWashPrice !== undefined) {
        const halfRange: Record<string, number> = {}
        if (filter.minHalfWashPrice !== undefined) halfRange.$gte = filter.minHalfWashPrice
        if (filter.maxHalfWashPrice !== undefined) halfRange.$lte = filter.maxHalfWashPrice
        pricingMatch["pricing.halfWashPrice"] = halfRange
      }
      
      if (filter.minFullWashPrice !== undefined || filter.maxFullWashPrice !== undefined) {
        const fullRange: Record<string, number> = {}
        if (filter.minFullWashPrice !== undefined) fullRange.$gte = filter.minFullWashPrice
        if (filter.maxFullWashPrice !== undefined) fullRange.$lte = filter.maxFullWashPrice
        pricingMatch["pricing.fullWashPrice"] = fullRange
      }

      pipeline.push({
        $lookup: {
          from: "station_pricing",
          localField: "_id",
          foreignField: "stationId",
          as: "pricing"
        }
      })
      
      pipeline.push({ $match: pricingMatch })
    }
    
    return pipeline
  }

  private buildExtraServiceLookup(filter: StationFilter | NearbyStationFilter): PipelineStage[] {
    const pipeline: PipelineStage[] = []

    if (filter.extraServiceIds && filter.extraServiceIds.length > 0) {
      const extraServiceObjectIds = filter.extraServiceIds.map((id) => new Types.ObjectId(id))
      
      pipeline.push({
        $lookup: {
          from: "extra_services",
          localField: "_id",
          foreignField: "stationId",
          as: "extraServices"
        }
      })
      
      pipeline.push({
        $match: {
          "extraServices._id": { $in: extraServiceObjectIds }
        }
      })
    }
    
    return pipeline
  }

  private buildSortStage(sortBy?: string, sortOrder?: "asc" | "desc"): PipelineStage {
    const allowedSortFields = ["createdAt", "updatedAt", "rating", "reviewCount", "name"]
    const sortField = sortBy && allowedSortFields.includes(sortBy) ? sortBy : "createdAt"
    const sortDirection = sortOrder === "asc" ? 1 : -1
    
    return { $sort: { [sortField]: sortDirection } }
  }

  private buildPagination(page: number = 1, limit: number = 10): PipelineStage[] {
    const p = Math.max(1, Number(page) || 1)
    const l = Math.max(1, Number(limit) || 10)
    const skip = (p - 1) * l
    return [
      { $skip: skip },
      { $limit: l }
    ]
  }

  private buildNearbyPipeline(filter: NearbyStationFilter): PipelineStage {
    return {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [filter.longitude, filter.latitude]
        },
        distanceField: "distance",
        maxDistance: filter.radiusKm * 1000,
        spherical: true
      }
    }
  }
}
