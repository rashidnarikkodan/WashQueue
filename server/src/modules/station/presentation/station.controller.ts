import { Request, Response } from "express"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import success from "@/common/utils/success"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
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

  getStations = async (req: AuthenticatedRequest, res: Response) => {
    const query = req.query || {}
    const parsedQuery = {
      ...query,
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 10,
      latitude: query.latitude ? Number(query.latitude) : undefined,
      longitude: query.longitude ? Number(query.longitude) : undefined,
      maxDistanceKm: query.maxDistanceKm ? Number(query.maxDistanceKm) : undefined,
      minimumRating: query.minimumRating
        ? Number(query.minimumRating)
        : query.minRating
        ? Number(query.minRating)
        : undefined,
      search: query.search ? String(query.search) : undefined,
      status: query.status ? String(query.status) : undefined,
      sortBy: query.sortBy ? String(query.sortBy) : undefined,
      sortOrder: query.sortOrder === "asc" ? ("asc" as const) : ("desc" as const),
      ownerId: query.ownerId ? String(query.ownerId) : undefined,
      vehicleCategory: query.vehicleCategory ? String(query.vehicleCategory) : undefined,
    }

    const { stations, total } = await this.getStationsUseCase.execute(parsedQuery)
    const page = Math.max(1, parsedQuery.page || 1)
    const limit = Math.max(1, parsedQuery.limit || 10)
    const totalPages = Math.ceil(total / limit) || 1

    const data = stations.map((s) => {
      const props = s.getProps()
      const distanceKm = (s as unknown as { distanceKm?: number }).distanceKm
      if (typeof distanceKm === "number") {
        (props as unknown as { distanceKm?: number }).distanceKm = distanceKm
      }
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
