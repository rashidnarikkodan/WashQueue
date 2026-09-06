import { Response } from "express"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import success from "@/common/utils/success"
import { AppError } from "@/common/errors/app-error"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import {
  ICreateVehicleUseCase,
  IUpdateVehicleUseCase,
  IDeleteVehicleUseCase,
  IGetVehicleUseCase,
  IGetVehiclesUseCase,
  ISetPrimaryVehicleUseCase,
} from "../application/interfaces/vehicle-usecases.interface"
import { IMediaStorage } from "@/core/application/interfaces/media.interface"

export class VehicleController {
  constructor(
    private readonly createVehicleUseCase: ICreateVehicleUseCase,
    private readonly updateVehicleUseCase: IUpdateVehicleUseCase,
    private readonly deleteVehicleUseCase: IDeleteVehicleUseCase,
    private readonly getVehicleUseCase: IGetVehicleUseCase,
    private readonly getVehiclesUseCase: IGetVehiclesUseCase,
    private readonly setPrimaryVehicleUseCase: ISetPrimaryVehicleUseCase,
    private readonly mediaStorage: IMediaStorage
  ) {}

  create = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const body = { ...req.body }

    const file = req.file as Express.Multer.File | undefined
    if (file) {
      const uploaded = await this.mediaStorage.upload(file.buffer, file.originalname)
      body.image = { url: uploaded.url, publicId: uploaded.publicId || "" }
    }

    const result = await this.createVehicleUseCase.execute(userId, body)
    success(res, result, HTTP_STATUS.CREATED, "Vehicle created successfully")
  }

  update = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { id } = req.params
    if (!id || typeof id !== "string") {
      throw new AppError("Vehicle ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const body = { ...req.body }
    const file = req.file as Express.Multer.File | undefined
    if (file) {
      const uploaded = await this.mediaStorage.upload(file.buffer, file.originalname)
      body.image = { url: uploaded.url, publicId: uploaded.publicId || "" }
    }

    const result = await this.updateVehicleUseCase.execute(id, userId, body)
    success(res, result, HTTP_STATUS.OK, "Vehicle updated successfully")
  }

  delete = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { id } = req.params
    if (!id || typeof id !== "string") {
      throw new AppError("Vehicle ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    await this.deleteVehicleUseCase.execute(id, userId)
    success(res, null, HTTP_STATUS.OK, "Vehicle deleted successfully")
  }

  getById = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { id } = req.params
    if (!id || typeof id !== "string") {
      throw new AppError("Vehicle ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const result = await this.getVehicleUseCase.execute(id, userId)
    success(res, result, HTTP_STATUS.OK, "Vehicle retrieved successfully")
  }

  getAll = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const result = await this.getVehiclesUseCase.execute(userId)
    success(res, result, HTTP_STATUS.OK, "Vehicles retrieved successfully")
  }

  setPrimary = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { id } = req.params
    if (!id || typeof id !== "string") {
      throw new AppError("Vehicle ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const result = await this.setPrimaryVehicleUseCase.execute(id, userId)
    success(res, result, HTTP_STATUS.OK, "Primary vehicle set successfully")
  }
}
