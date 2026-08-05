import { BaseRepository } from "@/infrastructure/database/repository/base.repository"
import { IStation, StationModel } from "../models/station.model"
import { Station } from "../../domain/entities/Station"
import { IStationRepository, StationFilter, NearbyStationFilter } from "../../domain/repositories/station.repository"
import { StationMapper } from "../mappers/station.mapper"
import { PipelineStage, Types } from "mongoose"
import { VehicleClassModel } from "@/modules/vehicle-catelog/infrastructure/models/class.model"
import { StationPricingModel } from "../models/station-pricing.model"
import { ExtraServiceModel } from "../models/extra-service.model"
import { StationRankingService, HydratedStationItem } from "../../domain/services/station-ranking.service"
import { StationRedisHydrationService } from "../services/station-redis-hydration.service"

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

  async findStationManagedByOwner(
    ownerId: string,
    managerUserId: string,
    excludeStationId?: string
  ): Promise<Station | null> {
    const query: Record<string, unknown> = {
      ownerId: Types.ObjectId.isValid(ownerId) ? new Types.ObjectId(ownerId) : ownerId,
      managerId: Types.ObjectId.isValid(managerUserId) ? new Types.ObjectId(managerUserId) : managerUserId,
    }

    if (excludeStationId && Types.ObjectId.isValid(excludeStationId)) {
      query._id = { $ne: new Types.ObjectId(excludeStationId) }
    }

    const doc = await this.model.findOne(query).exec()
    return doc ? this.mapper.toDomain(doc) : null
  }

  async findById(id: string): Promise<Station | null> {
    if (Types.ObjectId.isValid(id)) {
      const doc = await this.model.findById(id).exec()
      if (doc) return this.mapper.toDomain(doc)
    }
    // Fallback: search by name/slug if id parameter is a slug
    return this.findByName(id)
  }

  async findByIds(ids: string[]): Promise<Station[]> {
    if (!ids || ids.length === 0) return []

    const validObjectIds = ids
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id))

    const docs = await this.model
      .find({
        $or: [{ _id: { $in: validObjectIds } }, { _id: { $in: ids } }],
      })
      .exec()

    return docs.map((doc) => this.mapper.toDomain(doc))
  }

  async findAll(filter: StationFilter): Promise<{ stations: Station[]; total: number }> {
    const page = Math.max(1, Number(filter.page) || 1)
    const limit = Math.max(1, Number(filter.limit) || 10)

    const hasGeo =
      typeof filter.latitude === "number" &&
      typeof filter.longitude === "number" &&
      !isNaN(filter.latitude) &&
      !isNaN(filter.longitude) &&
      filter.latitude !== 0 &&
      filter.longitude !== 0

    // --- PHASE 1: Candidate Search Aggregation (Indexed Scan) ---
    const candidatePipeline: PipelineStage[] = []

    const radiusKm = filter.maxDistanceKm || filter.radiusKm || 50

    if (hasGeo) {
      candidatePipeline.push({
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [filter.longitude!, filter.latitude!],
          },
          distanceField: "distance",
          maxDistance: radiusKm * 1000,
          spherical: true,
        },
      })
    }

    const matchStage = this.buildMatchStage(filter)
    if (Object.keys(matchStage).length > 0) {
      candidatePipeline.push({ $match: matchStage })
    }

    // Limit candidate pool size to prevent high memory usage during hydration
    candidatePipeline.push({ $limit: 150 })

    const candidateDocs = await this.model.aggregate(candidatePipeline).exec()
    if (!candidateDocs || candidateDocs.length === 0) {
      return { stations: [], total: 0 }
    }

    const candidateStations = candidateDocs.map((doc: IStation & { distance?: number }) => {
      const domainObj = this.mapper.toDomain(doc as IStation)
      if (typeof doc.distance === "number") {
        const distanceKm = parseFloat((doc.distance / 1000).toFixed(1))
        ;(domainObj as unknown as Record<string, unknown>).distanceKm = distanceKm
      }
      return domainObj
    })

    const candidateIds = candidateStations.map((s) => new Types.ObjectId(s.id))

    // --- PHASE 2: Targeted Batch Relational Hydration & Filtering ---
    let matchingClassIds: Types.ObjectId[] | undefined = undefined
    if (filter.vehicleCategory && filter.vehicleCategory !== "all") {
      if (Types.ObjectId.isValid(filter.vehicleCategory)) {
        const catId = new Types.ObjectId(filter.vehicleCategory)
        const found = await VehicleClassModel.find({
          $or: [{ categoryId: catId }, { _id: catId }],
        }).select("_id").exec()
        matchingClassIds = found.map((c) => c._id as Types.ObjectId)
        if (matchingClassIds.length === 0) matchingClassIds = [catId]
      }
    } else if (filter.vehicleClassId && Types.ObjectId.isValid(filter.vehicleClassId)) {
      matchingClassIds = [new Types.ObjectId(filter.vehicleClassId)]
    }

    // Pricing Filter & Map
    const pricingQuery: Record<string, unknown> = {
      stationId: { $in: candidateIds },
      isActive: true,
    }
    if (matchingClassIds && matchingClassIds.length > 0) {
      pricingQuery.vehicleClassId = { $in: matchingClassIds }
    }

    const pricings = await StationPricingModel.find(pricingQuery).exec()
    const stationPricingMap = new Map<string, Array<{ half: number; full: number }>>()
    pricings.forEach((p) => {
      const sid = p.stationId.toString()
      const list = stationPricingMap.get(sid) || []
      list.push({ half: p.halfWashPrice, full: p.fullWashPrice })
      stationPricingMap.set(sid, list)
    })

    // Extra Services Filter
    let filterExtraServiceIds: Types.ObjectId[] | undefined = undefined
    if (filter.extraServices?.length || filter.extraServiceIds?.length) {
      const rawIds = filter.extraServices || filter.extraServiceIds || []
      filterExtraServiceIds = rawIds.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id))
    }

    const extraServiceQuery: Record<string, unknown> = {
      stationId: { $in: candidateIds },
      isActive: true,
    }
    if (filterExtraServiceIds && filterExtraServiceIds.length > 0) {
      extraServiceQuery._id = { $in: filterExtraServiceIds }
    }

    const extraServices = await ExtraServiceModel.find(extraServiceQuery).exec()
    const stationExtraServicesMap = new Map<string, number>()
    extraServices.forEach((es) => {
      const sid = es.stationId.toString()
      stationExtraServicesMap.set(sid, (stationExtraServicesMap.get(sid) || 0) + 1)
    })

    // --- PHASE 3: Redis Live Hydration ---
    const liveStateMap = await StationRedisHydrationService.hydrateLiveStates(candidateStations)

    // --- PHASE 4: Build Hydrated Candidate Items & Apply Relational Filters ---
    let hydratedItems: HydratedStationItem[] = []

    for (const station of candidateStations) {
      const sid = station.id
      const liveState = liveStateMap.get(sid) || { queueDepth: 0, estimatedWaitMins: 0, isOpen: true }

      // Filter openNow
      if (filter.openNow && !liveState.isOpen) {
        continue
      }

      // Filter vehicle category / class if filter active and no pricing matched
      if (matchingClassIds && matchingClassIds.length > 0 && !stationPricingMap.has(sid)) {
        continue
      }

      // Filter extra services if filter active and no extra services matched
      if (filterExtraServiceIds && filterExtraServiceIds.length > 0 && !stationExtraServicesMap.has(sid)) {
        continue
      }

      const pList = stationPricingMap.get(sid) || []
      let startingPrice: number | undefined = undefined
      if (pList.length > 0) {
        const prices = pList.flatMap((p) => [p.half, p.full]).filter((pr) => pr > 0)
        if (prices.length > 0) startingPrice = Math.min(...prices)
      }

      // Price Range Filter
      const minP = filter.minPrice ?? filter.minHalfWashPrice ?? filter.minFullWashPrice
      const maxP = filter.maxPrice ?? filter.maxHalfWashPrice ?? filter.maxFullWashPrice
      if (startingPrice !== undefined) {
        if (typeof minP === "number" && startingPrice < minP) continue
        if (typeof maxP === "number" && startingPrice > maxP) continue
      }

      const item: HydratedStationItem = {
        station,
        distanceKm: (station as unknown as { distanceKm?: number }).distanceKm,
        startingPrice,
        queueDepth: liveState.queueDepth,
        estimatedWaitMins: liveState.estimatedWaitMins,
        isVerified: !!station.getProps().verifiedAt,
        rating: station.getProps().rating || 0,
      }

      item.score = StationRankingService.computeScore(item)
      hydratedItems.push(item)
    }

    // --- PHASE 5: Deterministic Smart Ranking & Sorting ---
    hydratedItems = StationRankingService.sort(hydratedItems, filter.sortBy, filter.sortOrder)

    const total = hydratedItems.length

    // --- PHASE 6: Pagination Slicing & Property Hydration ---
    const skip = (page - 1) * limit
    const paginatedItems = hydratedItems.slice(skip, skip + limit)

    const resultStations = paginatedItems.map((item) => {
      const domainObj = item.station
      const rec = domainObj as unknown as Record<string, unknown>
      rec.distanceKm = item.distanceKm
      rec.startingPrice = item.startingPrice
      rec.estimatedWaitMins = item.estimatedWaitMins
      rec.queueDepth = item.queueDepth
      rec.isOpen = liveStateMap.get(domainObj.id)?.isOpen ?? true
      return domainObj
    })

    return {
      stations: resultStations,
      total,
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
      //for owners only
      match.ownerId = new Types.ObjectId(filter.ownerId)
    }
    if (filter.status && filter.status !== "all") {
      //for admin and owners
      match.status = filter.status
    } else if (!filter.status && !filter.ownerId) {
      //for public users
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
    if (filter.verifiedOnly) {
      match.verifiedAt = { $exists: true, $ne: null }
    }

    const minRating = filter.minimumRating ?? filter.minRating
    if (minRating !== undefined && minRating > 0) {
      match.rating = { $gte: minRating }
    }

    //in-case we add amenties filteration
    if (filter.amenities && filter.amenities.length > 0) {
      match.amenities = { $all: filter.amenities }
    }

    const q = filter.search ?? (filter as unknown as { q?: string }).q
    if (q && q.trim().length > 0) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const regex = new RegExp(escaped, "i")
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
}
