import { Request, Response } from "express"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import success from "@/common/utils/success"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { AppError } from "@/common/errors/app-error"
import {
  ICreateStationUseCase,
  IUpdateStationUseCase,
  IGetStationUseCase,
  IGetStationsUseCase,
  ISubmitStationUseCase,
  IReviewStationUseCase,
  IDeleteStationUseCase,
  IToggleActiveStationUseCase,
  IAssignManagerUseCase,
  IGetStationFilterOptionsUseCase,
  IConfigureSlotConfigUseCase,
  IGetSlotConfigUseCase,
  IGetBookingCalendarUseCase,
  IGetAvailableTimeWindowsUseCase,
} from "../application/interfaces/station-usecases.interface"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { StationRequestMapper } from "../application/mappers/station-request.mapper"
import {
  configureSlotConfigSchema,
  getAvailableTimeWindowsQuerySchema,
} from "./schema/station.schema"

export class StationController {
  constructor(
    private readonly stationMapper: StationRequestMapper,
    private readonly createStationUseCase: ICreateStationUseCase,
    private readonly updateStationUseCase: IUpdateStationUseCase,
    private readonly getStationUseCase: IGetStationUseCase,
    private readonly getStationsUseCase: IGetStationsUseCase,
    private readonly submitStationUseCase: ISubmitStationUseCase,
    private readonly reviewStationUseCase: IReviewStationUseCase,
    private readonly deleteStationUseCase: IDeleteStationUseCase,
    private readonly toggleActiveStationUseCase: IToggleActiveStationUseCase,
    private readonly assignManagerUseCase: IAssignManagerUseCase,
    private readonly ownerRepository: IOwnerRepository,
    private readonly configureSlotConfigUseCase: IConfigureSlotConfigUseCase,
    private readonly getSlotConfigUseCase: IGetSlotConfigUseCase,
    private readonly getBookingCalendarUseCase: IGetBookingCalendarUseCase,
    private readonly getAvailableTimeWindowsUseCase: IGetAvailableTimeWindowsUseCase,
    private readonly getStationFilterOptionsUseCase: IGetStationFilterOptionsUseCase
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
    const payload = await this.getStationFilterOptionsUseCase.execute()
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
      minRating: query.minRating
        ? Number(query.minRating)
        : query.minimumRating
          ? Number(query.minimumRating)
          : undefined,
      minimumRating: query.minimumRating
        ? Number(query.minimumRating)
        : query.minRating
          ? Number(query.minRating)
          : undefined,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      search: query.search ? String(query.search) : query.q ? String(query.q) : undefined,
      status: query.status ? String(query.status) : undefined,
      sortBy: query.sortBy ? String(query.sortBy) : undefined,
      sortOrder: query.sortOrder === "desc" ? ("desc" as const) : ("asc" as const),
      ownerId: query.ownerId ? String(query.ownerId) : undefined,
      vehicleCategory: query.vehicleCategory ? String(query.vehicleCategory) : undefined,
      vehicleClassId: query.vehicleClassId ? String(query.vehicleClassId) : undefined,
      washType: query.washType
        ? (String(query.washType).toUpperCase() as "HALF" | "FULL" | "ALL")
        : undefined,
      amenities: Array.isArray(query.amenities)
        ? query.amenities.map(String)
        : typeof query.amenities === "string"
          ? query.amenities.split(",")
          : undefined,
      openNow: String(query.openNow) === "true",
      verifiedOnly: String(query.verifiedOnly) === "true",
    }
    const userId = req.user?.userId || ''

    const { stations, total, statusCounts } = await this.getStationsUseCase.execute(parsedQuery,userId)

    const page = Math.max(1, parsedQuery.page || 1)
    const limit = Math.max(1, parsedQuery.limit || 10)
    const totalPages = Math.ceil(total / limit) || 1

    const data = stations.map((station) => ({
      ...station.getProps(),
      distanceKm: (station as unknown as Record<string, unknown>).distanceKm,
      startingPrice: (station as unknown as Record<string, unknown>).startingPrice,
      halfWashPrice: (station as unknown as Record<string, unknown>).halfWashPrice,
      fullWashPrice: (station as unknown as Record<string, unknown>).fullWashPrice,
      estimatedWaitMins: (station as unknown as Record<string, unknown>).estimatedWaitMins,
      queueDepth: (station as unknown as Record<string, unknown>).queueDepth,
      isOpen: (station as unknown as Record<string, unknown>).isOpen,
      isFavorite: station.isFavorite,
    }))

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
        statusCounts,
      },
      HTTP_STATUS.OK,
      "Stations retrieved successfully"
    )
  }

  submitForReview = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const stationId = this.stationMapper.extractStationId(req)
    const station = await this.submitStationUseCase.execute(stationId, userId)

    success(res, station.getProps(), HTTP_STATUS.OK, "Station submitted for review successfully")
  }

  review = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const stationId = this.stationMapper.extractStationId(req)
    const { action, rejectionReason } = req.body || {}
    const station = await this.reviewStationUseCase.execute(stationId, action, rejectionReason)

    success(
      res,
      station.getProps(),
      HTTP_STATUS.OK,
      `Station ${action.toLowerCase()}d successfully`
    )
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

  assignManager = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const stationId = this.stationMapper.extractStationId(req)
    const { managerType, email } = req.body || {}
    const station = await this.assignManagerUseCase.execute(stationId, userId, {
      managerType: managerType || "SELF",
      email,
    })

    success(res, station, HTTP_STATUS.OK, "Manager assigned for this station successfully")
  }

  configureSlotConfig = async (req: AuthenticatedRequest, res: Response) => {
    const stationId = req.params.stationId || req.params.id
    if (!stationId) {
      throw new AppError("Station ID is required", HTTP_STATUS.BAD_REQUEST)
    }
    const validated = configureSlotConfigSchema.parse(req.body)

    const result = await this.configureSlotConfigUseCase.execute({
      stationId,
      ...validated,
    })

    success(res, result, HTTP_STATUS.OK, "Slot configuration saved successfully")
  }

  getSlotConfig = async (req: Request, res: Response) => {
    const stationId = req.params.stationId || req.params.id
    if (!stationId) {
      throw new AppError("Station ID is required", HTTP_STATUS.BAD_REQUEST)
    }
    const result = await this.getSlotConfigUseCase.execute(stationId)
    success(res, result, HTTP_STATUS.OK, "Slot configuration fetched successfully")
  }

  getBookingCalendar = async (req: Request, res: Response) => {
    const stationId = req.params.stationId || req.params.id
    if (!stationId) {
      throw new AppError("Station ID is required", HTTP_STATUS.BAD_REQUEST)
    }
    const result = await this.getBookingCalendarUseCase.execute(stationId)
    success(res, result, HTTP_STATUS.OK, "Booking calendar fetched successfully")
  }

  getAvailableTimeWindows = async (req: Request, res: Response) => {
    const stationId = req.params.stationId || req.params.id
    if (!stationId) {
      throw new AppError("Station ID is required", HTTP_STATUS.BAD_REQUEST)
    }
    const { date } = getAvailableTimeWindowsQuerySchema.parse(req.query)

    const result = await this.getAvailableTimeWindowsUseCase.execute(stationId, date)
    success(res, result, HTTP_STATUS.OK, "Time windows fetched successfully")
  }
}
