import { Request, Response } from "express"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import success from "@/common/utils/success"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import redis from "@/infrastructure/cache/redis.client"
import { VehicleCategoryModel } from "@/modules/vehicle-catelog/infrastructure/models/category.model"
import { VehicleClassModel } from "@/modules/vehicle-catelog/infrastructure/models/class.model"
import { StationPricingModel } from "../infrastructure/models/station-pricing.model"
import {
  ICreateStationUseCase,
  IUpdateStationUseCase,
  IGetStationUseCase,
  IGetStationsUseCase,
  ISubmitStationUseCase,
  IReviewStationUseCase,
  IDeleteStationUseCase,
  IToggleActiveStationUseCase,
} from "../application/interfaces/station-usecases.interface"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { StationRequestMapper } from "./mappers/station.mapper"


export class StationController {
  constructor(
    private readonly createStationUseCase: ICreateStationUseCase,
    private readonly updateStationUseCase: IUpdateStationUseCase,
    private readonly getStationUseCase: IGetStationUseCase,
    private readonly getStationsUseCase: IGetStationsUseCase,
    private readonly submitStationUseCase: ISubmitStationUseCase,
    private readonly reviewStationUseCase: IReviewStationUseCase,
    private readonly deleteStationUseCase: IDeleteStationUseCase,
    private readonly toggleActiveStationUseCase: IToggleActiveStationUseCase,
    private readonly ownerRepository: IOwnerRepository,
    private readonly stationMapper: StationRequestMapper
  ) {}

  create = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const input = this.stationMapper.mapToCreateInput(req)
    const station = await this.createStationUseCase.execute(userId, input)
    
    success(
      res,
      { stationId: station.id, station: station.getProps() },
      HTTP_STATUS.CREATED,
      "Station draft created successfully"
    )
  }

  update = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const stationId = this.stationMapper.extractStationId(req)
    const updates = await this.stationMapper.mapToUpdateInput(req)
    const result = await this.updateStationUseCase.execute(stationId, userId, updates)

    success(res, result, HTTP_STATUS.OK, "Station updated successfully")
  }

  getById = async (req: Request, res: Response) => {
    const stationId = this.stationMapper.extractStationId(req)
    const result = await this.getStationUseCase.execute(stationId)

    success(res, result, HTTP_STATUS.OK, "Station retrieved successfully")
  }

  getFilterOptions = async (_req: Request, res: Response) => {
    // Check Redis cache first
    try {
      const cached = await redis.get("cache:stations:filter_options")
      if (cached) {
        success(res, JSON.parse(cached), HTTP_STATUS.OK, "Filter options retrieved successfully")
        return
      }
    } catch {
      // Ignore redis read error fallback to DB
    }

    const categories = await VehicleCategoryModel.find({ isActive: true }).sort({ order: 1 }).exec()
    const classes = await VehicleClassModel.find({ isActive: true }).sort({ order: 1 }).exec()
    const priceAggregation = await StationPricingModel.aggregate([
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

    const priceStats = priceAggregation[0] || { minHalf: 10, maxHalf: 200, minFull: 20, maxFull: 300 }
    const minPrice = Math.min(priceStats.minHalf || 10, priceStats.minFull || 20)
    const maxPrice = Math.max(priceStats.maxHalf || 200, priceStats.maxFull || 300)

    const payload = {
      vehicleCategories: categories.map((c) => ({
        id: c._id.toString(),
        slug: c.slug,
        name: c.name,
      })),
      vehicleClasses: classes.map((c) => ({
        id: c._id.toString(),
        categoryId: c.categoryId.toString(),
        slug: c.slug,
        name: c.name,
      })),
      amenities: [
        { slug: "wifi", name: "Free Wi-Fi", icon: "wifi" },
        { slug: "waiting_lounge", name: "AC Waiting Lounge", icon: "sofa" },
        { slug: "cafe", name: "Café / Coffee", icon: "coffee" },
        { slug: "ev_charging", name: "EV Charging", icon: "zap" },
        { slug: "restroom", name: "Clean Restrooms", icon: "bath" },
      ],
      priceBounds: {
        minPrice,
        maxPrice,
        currency: "USD",
      },
      sortOptions: [
        { value: "RECOMMENDED", label: "Recommended" },
        { value: "DISTANCE", label: "Nearest" },
        { value: "RATING", label: "Highest Rated" },
        { value: "WAIT_TIME", label: "Shortest Wait Time" },
        { value: "PRICE_LOW_TO_HIGH", label: "Price: Low to High" },
        { value: "PRICE_HIGH_TO_LOW", label: "Price: High to Low" },
      ],
    }

    try {
      await redis.set("cache:stations:filter_options", JSON.stringify(payload), "EX", 86400) // 24h
    } catch {
      // Ignore cache write error
    }

    success(res, payload, HTTP_STATUS.OK, "Filter options retrieved successfully")
  }

  getStations = async (req: AuthenticatedRequest, res: Response) => {
    const query = req.query || {}
    const parsedQuery = {
      ...query,
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 10,
      latitude: query.latitude ? Number(query.latitude) : undefined,
      longitude: query.longitude ? Number(query.longitude) : undefined,
      maxDistanceKm: query.maxDistanceKm ? Number(query.maxDistanceKm) : undefined,
      radiusKm: query.radiusKm ? Number(query.radiusKm) : undefined,
      minRating: query.minRating ? Number(query.minRating) : query.minimumRating ? Number(query.minimumRating) : undefined,
      minimumRating: query.minimumRating ? Number(query.minimumRating) : query.minRating ? Number(query.minRating) : undefined,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      search: query.search ? String(query.search) : query.q ? String(query.q) : undefined,
      status: query.status ? String(query.status) : undefined,
      sortBy: query.sortBy ? String(query.sortBy) : undefined,
      sortOrder: query.sortOrder === "asc" ? ("asc" as const) : ("desc" as const),
      ownerId: query.ownerId ? String(query.ownerId) : undefined,
      vehicleCategory: query.vehicleCategory ? String(query.vehicleCategory) : undefined,
      vehicleClassId: query.vehicleClassId ? String(query.vehicleClassId) : undefined,
      openNow: String(query.openNow) === "true",
      verifiedOnly: String(query.verifiedOnly) === "true",

    }

    const { stations, total } = await this.getStationsUseCase.execute(parsedQuery)
    const page = Math.max(1, parsedQuery.page || 1)
    const limit = Math.max(1, parsedQuery.limit || 10)
    const totalPages = Math.ceil(total / limit) || 1

    const data = stations.map((s) => {
      const props = s.getProps()
      const rec = s as unknown as Record<string, unknown>
      if (typeof rec.distanceKm === "number") (props as unknown as Record<string, unknown>).distanceKm = rec.distanceKm
      if (typeof rec.startingPrice === "number") (props as unknown as Record<string, unknown>).startingPrice = rec.startingPrice
      if (typeof rec.estimatedWaitMins === "number") (props as unknown as Record<string, unknown>).estimatedWaitMins = rec.estimatedWaitMins
      if (typeof rec.queueDepth === "number") (props as unknown as Record<string, unknown>).queueDepth = rec.queueDepth
      if (typeof rec.isOpen === "boolean") (props as unknown as Record<string, unknown>).isOpen = rec.isOpen
      return props
    })

    success(
      res,
      {
        stations: data,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      HTTP_STATUS.OK,
      "Stations retrieved successfully"
    )
  }

  submit = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const stationId = this.stationMapper.extractStationId(req)
    const station = await this.submitStationUseCase.execute(stationId, userId)

    success(res, station.getProps(), HTTP_STATUS.OK, "Station submitted successfully for review")
  }

  review = async (req: AuthenticatedRequest, res: Response) => {
    const stationId = this.stationMapper.extractStationId(req)
    const { action, rejectionReason } = this.stationMapper.extractReviewInput(req)
    const station = await this.reviewStationUseCase.execute(stationId, action, rejectionReason)

    success(res, station.getProps(), HTTP_STATUS.OK, `Station ${action.toLowerCase()}d successfully`)
  }

  delete = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const stationId = this.stationMapper.extractStationId(req)
    const owner = await this.ownerRepository.findByUserId(userId)
    if (!owner?.id) {
      throw new ForbiddenError(ERROR_MESSAGES.OWNER_NOT_FOUND)
    }

    await this.deleteStationUseCase.execute(stationId, owner.id)
    success(res, null, HTTP_STATUS.OK, "Station draft deleted successfully")
  }

  toggleActive = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const stationId = this.stationMapper.extractStationId(req)
    const station = await this.toggleActiveStationUseCase.execute(stationId, userId)
    const props = station.getProps()

    success(
      res,
      props,
      HTTP_STATUS.OK,
      `Station ${props.isActive ? "activated" : "deactivated"} successfully`
    )
  }
}
