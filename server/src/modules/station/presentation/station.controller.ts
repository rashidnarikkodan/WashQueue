import { Response } from "express"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import success from "@/common/utils/success"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import {
  ICreateStationUseCase,
  IUpdateStationUseCase,
  IGetStationUseCase,
  IGetStationsUseCase,
  ISubmitStationUseCase,
  IReviewStationUseCase,
} from "../application/interfaces/station-usecases.interface"
import { StationRequestMapper } from "./mappers/station.mapper"
import { IMediaStorage } from "@/core/application/interfaces/media.interface"

export class StationController {
  constructor(
    private readonly createStationUseCase: ICreateStationUseCase,
    private readonly updateStationUseCase: IUpdateStationUseCase,
    private readonly getStationUseCase: IGetStationUseCase,
    private readonly getStationsUseCase: IGetStationsUseCase,
    private readonly submitStationUseCase: ISubmitStationUseCase,
    private readonly stationMapper: StationRequestMapper,
    private readonly reviewStationUseCase: IReviewStationUseCase,
    private readonly mediaStorage: IMediaStorage
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
    const updates = this.stationMapper.mapToUpdateInput(req)
    const result = await this.updateStationUseCase.execute(stationId, userId, updates)

    success(res, result, HTTP_STATUS.OK, "Station updated successfully")
  }

  getById = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const stationId = this.stationMapper.extractStationId(req)
    const result = await this.getStationUseCase.execute(stationId, userId)

    success(res, result, HTTP_STATUS.OK, "Station retrieved successfully")
  }

  getStations = async (req: AuthenticatedRequest, res: Response) => {
    const stations = await this.getStationsUseCase.execute(req.query)
    const data = stations.map((s) => s.getProps())
    success(res, data, HTTP_STATUS.OK, "Stations retrieved successfully")
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
    const { stationId } = req.params
    if (!stationId) {
      throw new AppError("Station ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const station = await this.submitStationUseCase.execute(stationId, userId)

    success(res, station.getProps(), HTTP_STATUS.OK, "Station submitted successfully for review")
  }

  review = async (req: AuthenticatedRequest, res: Response) => {
    const { stationId } = req.params
    if (!stationId) {
      throw new AppError("Station ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const { action, rejectionReason } = req.body
    const station = await this.reviewStationUseCase.execute(stationId, action, rejectionReason)

    success(
      res,
      station.getProps(),
      HTTP_STATUS.OK,
      `Station ${action === "APPROVE" ? "approved" : "rejected"} successfully`
    )
  }
}
