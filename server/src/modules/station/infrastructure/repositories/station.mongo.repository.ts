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

  async findAll(filter: StationFilter): Promise<{ stations: Station[]; total: number }> {
    const pipeline: PipelineStage[] = []

    // 1. GeoNear Stage (Must be first stage if location filter is present)
    if (
      typeof filter.latitude === "number" &&
      typeof filter.longitude === "number" &&
      !isNaN(filter.latitude) &&
      !isNaN(filter.longitude) &&
      filter.latitude !== 0 &&
      filter.longitude !== 0
    ) {
      const radiusKm = filter.maxDistanceKm && filter.maxDistanceKm > 0 ? filter.maxDistanceKm : 50
      pipeline.push({
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [filter.longitude, filter.latitude],
          },
          distanceField: "distance",
          maxDistance: radiusKm * 1000,
          spherical: true,
        },
      })
    }

    // 2. Match Stage
    const matchStage = this.buildMatchStage(filter)
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage })
    }

    // 3. Pricing Lookup & Match
    pipeline.push(...this.buildPricingLookup(filter))

    // 4. Extra Services Lookup & Match
    pipeline.push(...this.buildExtraServiceLookup(filter))

    // 5. Sort Stage
    pipeline.push(this.buildSortStage(filter.sortBy, filter.sortOrder, filter.latitude !== undefined))

    // 6. Facet Stage for Count + Pagination
    const page = Math.max(1, Number(filter.page) || 1)
    const limit = Math.max(1, Number(filter.limit) || 10)
    const skip = (page - 1) * limit

    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    })

    const result = await this.model.aggregate(pipeline).exec()
    const metadata = result[0]?.metadata?.[0] || { total: 0 }
    const rawDocs = result[0]?.data || []

    const stations = rawDocs.map((doc: IStation & { distance?: number }) => {
      const domainObj = this.mapper.toDomain(doc as IStation)
      // Attach calculated distance in km if available from geoNear
      if (typeof doc.distance === "number") {
        const distanceKm = parseFloat((doc.distance / 1000).toFixed(1))
        ;(domainObj as unknown as Record<string, unknown>).distanceKm = distanceKm
      }
      return domainObj
    })

    return {
      stations,
      total: metadata.total,
    }
  }

  async findNearby(filter: NearbyStationFilter): Promise<Station[]> {
    const res = await this.findAll({
      latitude: filter.latitude,
      longitude: filter.longitude,
      maxDistanceKm: filter.radiusKm,
      vehicleClassId: filter.vehicleClassId,
      extraServiceIds: filter.extraServiceIds,
      minimumRating: filter.minimumRating,
      minHalfWashPrice: filter.minHalfWashPrice,
      maxHalfWashPrice: filter.maxHalfWashPrice,
      minFullWashPrice: filter.minFullWashPrice,
      maxFullWashPrice: filter.maxFullWashPrice,
      page: filter.page,
      limit: filter.limit,
      status: "ACTIVE",
    })
    return res.stations
  }

  private buildMatchStage(filter: StationFilter): Record<string, unknown> {
    const match: Record<string, unknown> = {}

    if (filter.ownerId) {
      match.ownerId = new Types.ObjectId(filter.ownerId)
    }
    if (filter.status) {
      match.status = filter.status
    } else if (!filter.ownerId) {
      // Default to ACTIVE for public discovery if no status explicitly requested
      match.status = "ACTIVE"
    }

    if (filter.city) {
      match["address.city"] = { $regex: filter.city, $options: "i" }
    }
    if (filter.state) {
      match["address.state"] = { $regex: filter.state, $options: "i" }
    }
    if (filter.country) {
      match["address.country"] = { $regex: filter.country, $options: "i" }
    }
    if (filter.isActive !== undefined) {
      match.isActive = filter.isActive
    }
    if (filter.minimumRating !== undefined && filter.minimumRating > 0) {
      match.rating = { $gte: filter.minimumRating }
    }

    if (filter.search && filter.search.trim().length > 0) {
      const q = filter.search.trim()
      const regex = new RegExp(q, "i")
      match.$or = [
        { name: regex },
        { description: regex },
        { "address.street": regex },
        { "address.city": regex },
        { "address.state": regex },
        { "address.pincode": regex },
      ]
    }

    return match
  }

  private buildPricingLookup(filter: StationFilter | NearbyStationFilter): PipelineStage[] {
    const pipeline: PipelineStage[] = []
    
    const hasPricingFilter = 
      filter.vehicleClassId || 
      ("vehicleCategory" in filter && filter.vehicleCategory && filter.vehicleCategory !== "all") ||
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
          as: "pricing",
        },
      })
      
      if (Object.keys(pricingMatch).length > 0) {
        pipeline.push({ $match: pricingMatch })
      }
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
          as: "extraServices",
        },
      })
      
      pipeline.push({
        $match: {
          "extraServices._id": { $in: extraServiceObjectIds },
        },
      })
    }
    
    return pipeline
  }

  private buildSortStage(sortBy?: string, sortOrder?: "asc" | "desc", hasGeo: boolean = false): PipelineStage {
    const dir = sortOrder === "asc" ? 1 : -1
    
    switch (sortBy) {
      case "nearest":
        return hasGeo ? { $sort: { distance: 1 } } : { $sort: { createdAt: -1 } }
      case "rating":
        return { $sort: { rating: dir, reviewCount: -1 } }
      case "popular":
        return { $sort: { reviewCount: dir, rating: -1 } }
      case "fastest":
        return { $sort: { "slotConfig.windowDurationMins": 1, "slotConfig.bays": -1 } }
      case "name":
        return { $sort: { name: sortOrder === "desc" ? -1 : 1 } }
      default:
        return hasGeo ? { $sort: { distance: 1 } } : { $sort: { rating: -1, createdAt: -1 } }
    }
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

