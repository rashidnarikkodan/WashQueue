import { BaseRepository } from "@/infrastructure/database/repository/base.repository"
import { IStation, StationModel } from "../models/station.model"
import { Station } from "../../domain/entities/Station"
import {
  IStationRepository,
  StationFilter,
  NearbyStationFilter,
} from "../../domain/repositories/station.repository"
import { StationMapper } from "../mappers/station.mapper"
import { PipelineStage, Types } from "mongoose"
import { VehicleClassModel } from "@/modules/vehicle-catelog/infrastructure/models/class.model"
import { StationPricingModel } from "../models/station-pricing.model"
import { ExtraServiceModel } from "../models/extra-service.model"
import { Owner as OwnerModel } from "@/modules/owner/infrastructure/model/owner.model"
import {
  StationRankingService,
  HydratedStationItem,
} from "../../domain/services/station-ranking.service"
import { StationRedisHydrationService } from "../services/station-redis-hydration.service"
import { StationStatusCounts } from "../../application/dtos/get-stations.dto"

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

  async findByManagerId(managerId: string): Promise<Station[]> {
    if (!Types.ObjectId.isValid(managerId)) return []
    const docs = await this.model
      .find({ managerId: new Types.ObjectId(managerId) })
      .sort({ name: 1 })
      .exec()
    return docs.map((doc) => this.mapper.toDomain(doc))
  }

  async setManagerId(stationId: string, managerId: string | null): Promise<void> {
    if (!Types.ObjectId.isValid(stationId)) return
    if (managerId && Types.ObjectId.isValid(managerId)) {
      await this.model.findByIdAndUpdate(stationId, {
        $set: { managerId: new Types.ObjectId(managerId) },
      })
    } else {
      await this.model.findByIdAndUpdate(stationId, {
        $unset: { managerId: 1 },
      })
    }
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
      managerId: Types.ObjectId.isValid(managerUserId)
        ? new Types.ObjectId(managerUserId)
        : managerUserId,
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

  async findAll(
    filter: StationFilter
  ): Promise<{ stations: Station[]; total: number; statusCounts?: StationStatusCounts }> {
    const page = Math.max(1, Number(filter.page) || 1)
    const limit = Math.max(1, Number(filter.limit) || 10)

    const hasGeo =
      typeof filter.latitude === "number" &&
      typeof filter.longitude === "number" &&
      !isNaN(filter.latitude) &&
      !isNaN(filter.longitude) &&
      filter.latitude !== 0 &&
      filter.longitude !== 0

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

    const matchStage = await this.buildMatchStage(filter)
    if (Object.keys(matchStage).length > 0) {
      candidatePipeline.push({ $match: matchStage })
    }

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

    let matchingClassIds: Types.ObjectId[] | undefined = undefined
    if (filter.vehicleClassId && Types.ObjectId.isValid(filter.vehicleClassId)) {
      matchingClassIds = [new Types.ObjectId(filter.vehicleClassId)]
    } else if (filter.vehicleCategory && filter.vehicleCategory !== "all") {
      if (Types.ObjectId.isValid(filter.vehicleCategory)) {
        const catId = new Types.ObjectId(filter.vehicleCategory)
        const found = await VehicleClassModel.find({
          $or: [{ categoryId: catId }, { _id: catId }],
        })
          .select("_id")
          .exec()
        matchingClassIds = found.map((c) => c._id as Types.ObjectId)
        if (matchingClassIds.length === 0) matchingClassIds = [catId]
      }
    }

    const pricingQuery: Record<string, unknown> = {
      stationId: { $in: candidateIds },
      isActive: true,
    }
    if (matchingClassIds && matchingClassIds.length > 0) {
      pricingQuery.vehicleClassId = { $in: matchingClassIds }
    }

    const pricings = await StationPricingModel.find(pricingQuery).exec()
    const stationPricingMap = new Map<
      string,
      Array<{ half: number; full: number; vehicleClassId: string }>
    >()
    pricings.forEach((p) => {
      const sid = p.stationId.toString()
      const list = stationPricingMap.get(sid) || []
      list.push({
        half: p.halfWashPrice,
        full: p.fullWashPrice,
        vehicleClassId: p.vehicleClassId.toString(),
      })
      stationPricingMap.set(sid, list)
    })

    let filterExtraServiceIds: Types.ObjectId[] | undefined = undefined
    if (filter.extraServices?.length || filter.extraServiceIds?.length) {
      const rawIds = filter.extraServices || filter.extraServiceIds || []
      filterExtraServiceIds = rawIds
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id))
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

    const liveStateMap = await StationRedisHydrationService.hydrateLiveStates(candidateStations)

    let hydratedItems: (HydratedStationItem & {
      halfWashPrice?: number
      fullWashPrice?: number
    })[] = []

    for (const station of candidateStations) {
      const sid = station.id
      const liveState = liveStateMap.get(sid) || {
        queueDepth: 0,
        estimatedWaitMins: 0,
        isOpen: true,
      }

      if (filter.openNow && !liveState.isOpen) {
        continue
      }

      if (matchingClassIds && matchingClassIds.length > 0 && !stationPricingMap.has(sid)) {
        continue
      }

      if (
        filterExtraServiceIds &&
        filterExtraServiceIds.length > 0 &&
        !stationExtraServicesMap.has(sid)
      ) {
        continue
      }

      const pList = stationPricingMap.get(sid) || []
      let startingPrice: number | undefined = undefined
      let halfWashPrice: number | undefined = undefined
      let fullWashPrice: number | undefined = undefined

      if (pList.length > 0) {
        if (filter.vehicleClassId) {
          const matchP = pList.find((p) => p.vehicleClassId === filter.vehicleClassId) || pList[0]
          halfWashPrice = matchP?.half
          fullWashPrice = matchP?.full
        } else {
          const halfs = pList.map((p) => p.half).filter((v) => v > 0)
          const fulls = pList.map((p) => p.full).filter((v) => v > 0)
          if (halfs.length > 0) halfWashPrice = Math.min(...halfs)
          if (fulls.length > 0) fullWashPrice = Math.min(...fulls)
        }

        const prices = pList.flatMap((p) => [p.half, p.full]).filter((pr) => pr > 0)
        if (prices.length > 0) startingPrice = Math.min(...prices)
      }

      if (filter.washType === "HALF" && halfWashPrice === undefined) continue
      if (filter.washType === "FULL" && fullWashPrice === undefined) continue

      const minP = filter.minPrice ?? filter.minHalfWashPrice ?? filter.minFullWashPrice
      const maxP = filter.maxPrice ?? filter.maxHalfWashPrice ?? filter.maxFullWashPrice
      const comparePrice =
        filter.washType === "HALF"
          ? halfWashPrice
          : filter.washType === "FULL"
            ? fullWashPrice
            : startingPrice
      if (comparePrice !== undefined) {
        if (typeof minP === "number" && comparePrice < minP) continue
        if (typeof maxP === "number" && comparePrice > maxP) continue
      }

      const item: HydratedStationItem & { halfWashPrice?: number; fullWashPrice?: number } = {
        station,
        distanceKm: (station as unknown as { distanceKm?: number }).distanceKm,
        startingPrice,
        halfWashPrice,
        fullWashPrice,
        queueDepth: liveState.queueDepth,
        estimatedWaitMins: liveState.estimatedWaitMins,
        isVerified: !!station.getProps().verifiedAt,
        rating: station.getProps().rating || 0,
      }

      item.score = StationRankingService.computeScore(item)
      hydratedItems.push(item)
    }

    hydratedItems = StationRankingService.sort(hydratedItems, filter.sortBy, filter.sortOrder)

    const total = hydratedItems.length

    const skip = (page - 1) * limit
    const paginatedItems = hydratedItems.slice(skip, skip + limit)

    const resultStations = paginatedItems.map((item) => {
      const domainObj = item.station
      const rec = domainObj as unknown as Record<string, unknown>
      rec.distanceKm = item.distanceKm
      rec.startingPrice = item.startingPrice
      rec.halfWashPrice = item.halfWashPrice
      rec.fullWashPrice = item.fullWashPrice
      rec.estimatedWaitMins = item.estimatedWaitMins
      rec.queueDepth = item.queueDepth
      rec.isOpen = liveStateMap.get(domainObj.id)?.isOpen ?? true
      return domainObj
    })

    const countMatchFilter = { ...filter }
    delete countMatchFilter.status

    const countMatchStage = await this.buildMatchStage(countMatchFilter)
    const countAggregation: PipelineStage[] = []
    if (hasGeo) {
      countAggregation.push({
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
    if (Object.keys(countMatchStage).length > 0) {
      countAggregation.push({ $match: countMatchStage })
    }
    countAggregation.push({
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    })

    const statusCountsRaw = await this.model.aggregate(countAggregation).exec()
    const statusCounts: StationStatusCounts = {
      all: 0,
      draft: 0,
      pending: 0,
      active: 0,
      inactive: 0,
      suspended: 0,
      rejected: 0,
    }

    let grandTotal = 0
    statusCountsRaw.forEach((row: { _id: string; count: number }) => {
      const st = row._id
      const c = row.count || 0
      grandTotal += c
      if (st === "DRAFT") statusCounts.draft = c
      else if (st === "PENDING_REVIEW") statusCounts.pending = c
      else if (st === "ACTIVE") statusCounts.active = c
      else if (st === "INACTIVE") statusCounts.inactive = c
      else if (st === "SUSPENDED") statusCounts.suspended = c
      else if (st === "REJECTED") statusCounts.rejected = c
    })
    statusCounts.all = grandTotal

    return {
      stations: resultStations,
      total,
      statusCounts,
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

  private async buildMatchStage(filter: StationFilter): Promise<Record<string, unknown>> {
    const match: Record<string, unknown> = {}

    if (filter.ownerId) {
      const ownerIdStr = String(filter.ownerId)
      const possibleIds: Types.ObjectId[] = []
      if (Types.ObjectId.isValid(ownerIdStr)) {
        possibleIds.push(new Types.ObjectId(ownerIdStr))
      }

      try {
        const ownerDoc = await OwnerModel.findOne({
          $or: [
            ...(Types.ObjectId.isValid(ownerIdStr)
              ? [{ _id: new Types.ObjectId(ownerIdStr) }]
              : []),
            ...(Types.ObjectId.isValid(ownerIdStr)
              ? [{ userId: new Types.ObjectId(ownerIdStr) }]
              : []),
          ],
        }).exec()

        if (ownerDoc) {
          const ownerObjId = ownerDoc._id as Types.ObjectId
          const userObjId = ownerDoc.userId as Types.ObjectId
          if (ownerObjId && !possibleIds.some((id) => id.equals(ownerObjId))) {
            possibleIds.push(ownerObjId)
          }
          if (userObjId && !possibleIds.some((id) => id.equals(userObjId))) {
            possibleIds.push(userObjId)
          }
        }
      } catch {
      }

      match.ownerId = { $in: possibleIds }
    }

    if (filter.status && filter.status !== "all") {
      match.status = filter.status
    } else if (!filter.status && !filter.ownerId) {
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
