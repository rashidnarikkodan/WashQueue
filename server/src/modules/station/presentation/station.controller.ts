import { Response } from "express"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import success from "@/common/utils/success"
import { AppError } from "@/common/errors/app-error"
import {
  ICreateStationUseCase,
  IUpdateStationUseCase,
  IGetStationUseCase,
  ISubmitStationUseCase,
} from "../application/interfaces/station-usecases.interface"
import { createStationSchema, patchStationSchema } from "./schema/station.schema"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"

export class StationController {
  constructor(
    private readonly createStationUseCase: ICreateStationUseCase,
    private readonly updateStationUseCase: IUpdateStationUseCase,
    private readonly getStationUseCase: IGetStationUseCase,
    private readonly submitStationUseCase: ISubmitStationUseCase
  ) {}

  /** POST /api/stations */
  create = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const validatedBody = createStationSchema.parse(req.body)
    const station = await this.createStationUseCase.execute({
      ...validatedBody,
      ownerId: userId,
    })

    success(
      res,
      { stationId: station.id, station: station.getProps() },
      HTTP_STATUS.CREATED,
      "Station draft created successfully"
    )
  }

  /** PATCH /api/stations/:stationId */
  update = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { stationId } = req.params
    if (!stationId) {
      throw new AppError("Station ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const validatedBody = patchStationSchema.parse(req.body)
    const result = await this.updateStationUseCase.execute(stationId, userId, validatedBody)

    success(res, result, HTTP_STATUS.OK, "Station draft updated successfully")
  }

  /** GET /api/stations/:stationId */
  getById = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { stationId } = req.params
    if (!stationId) {
      throw new AppError("Station ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const result = await this.getStationUseCase.execute(stationId, userId)
    success(res, result, HTTP_STATUS.OK, "Station draft retrieved successfully")
  }

  /** POST /api/stations/:stationId/submit */
  submit = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { stationId } = req.params
    if (!stationId) {
      throw new AppError("Station ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const station = await this.submitStationUseCase.execute(stationId, userId)
    success(res, station.getProps(), HTTP_STATUS.OK, "Station submitted successfully for review")
  }
}