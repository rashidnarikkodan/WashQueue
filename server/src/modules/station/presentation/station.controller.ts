import { Request, Response } from "express"
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

export class StationController {
  constructor(
    private readonly createStationUseCase: ICreateStationUseCase,
    private readonly updateStationUseCase: IUpdateStationUseCase,
    private readonly getStationUseCase: IGetStationUseCase,
    private readonly getStationsUseCase: IGetStationsUseCase,
    private readonly submitStationUseCase: ISubmitStationUseCase,
    private readonly reviewStationUseCase: IReviewStationUseCase,
    private readonly stationMapper: StationRequestMapper
  ) {}

  create = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const input = await this.stationMapper.mapToCreateInput(req)
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
    const stationId = this.stationMapper.extractStationId(req)
    const { action, rejectionReason } = this.stationMapper.extractReviewInput(req)
    const station = await this.reviewStationUseCase.execute(stationId, action, rejectionReason)

    success(res, station.getProps(), HTTP_STATUS.OK, `Station ${action.toLowerCase()}d successfully`)
  }
}
