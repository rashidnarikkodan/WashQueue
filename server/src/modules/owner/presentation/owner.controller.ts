import { Response } from "express"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import {
  ICreateOwnerUseCase,
  IGetOwnerUseCase,
  IUpdateOwnerUseCase,
} from "../application/interfaces/owner-usecases.interfaces"
import { createOwnerSchema, updateOwnerSchema } from "./schema/owner.schema"
import success from "@/common/utils/success"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { NotFoundError } from "@/common/errors/not-found-error"
import { AppError } from "@/common/errors/app-error"
import { SUCCESS_MESSAGES } from "@/common/constants/app.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"

export class OwnerController {
  constructor(
    private readonly createOwnerUseCase: ICreateOwnerUseCase,
    private readonly getOwnerUseCase: IGetOwnerUseCase,
    private readonly updateOwnerUseCase: IUpdateOwnerUseCase
  ) {}

  createOwner = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new AppError(ERROR_MESSAGES.USER_ID_REQUIRED, HTTP_STATUS.BAD_REQUEST)
    }

    const validatedBody = createOwnerSchema.parse(req.body)
    const data = await this.createOwnerUseCase.execute({
      ...validatedBody,
      userId,
    })

    success(res, data, HTTP_STATUS.CREATED, SUCCESS_MESSAGES.OWNER_CREATED_SUCCESS)
  }

  getOwnerProfile = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new AppError(ERROR_MESSAGES.USER_ID_REQUIRED, HTTP_STATUS.BAD_REQUEST)
    }

    const data = await this.getOwnerUseCase.execute(userId)
    if (!data) {
      throw new NotFoundError(ERROR_MESSAGES.OWNER_NOT_FOUND)
    }

    success(res, data, HTTP_STATUS.OK, SUCCESS_MESSAGES.OWNER_RETRIEVED_SUCCESS)
  }

  updateOwnerProfile = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new AppError(ERROR_MESSAGES.USER_ID_REQUIRED, HTTP_STATUS.BAD_REQUEST)
    }

    const validatedBody = updateOwnerSchema.parse(req.body)
    const data = await this.updateOwnerUseCase.execute(userId, validatedBody)

    if (!data) {
      throw new NotFoundError(ERROR_MESSAGES.OWNER_NOT_FOUND)
    }

    success(res, data, HTTP_STATUS.OK, SUCCESS_MESSAGES.OWNER_UPDATED_SUCCESS)
  }
}
