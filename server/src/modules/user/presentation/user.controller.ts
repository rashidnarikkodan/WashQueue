import { Request, Response } from "express"
import {
  IGetUsersUseCase,
  IGetUserUseCase,
  IUpdateUserUseCase,
} from "../application/interfaces/user-usecases.interfaces"
import { usersQuerySchema } from "./schema/get-users.schema"
import success from "@/common/utils/success"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { NotFoundError } from "@/common/errors/not-found-error"
import { SUCCESS_MESSAGES } from "@/common/constants/app.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"

export class UserController {
  constructor(
    private readonly getUsersUseCase: IGetUsersUseCase,
    private readonly getUserUseCase: IGetUserUseCase,
    private readonly updateUserUseCase: IUpdateUserUseCase
  ) {}

  getUsers = async (req: Request, res: Response) => {
    const query = usersQuerySchema.parse(req.query)
    const data = await this.getUsersUseCase.execute(query)
    success(res, data, HTTP_STATUS.OK, SUCCESS_MESSAGES.USERS_RETRIEVED_SUCCESS)
  }

  getUser = async (req: Request, res: Response) => {
    const { id } = req.params
    if (!id) throw new NotFoundError(ERROR_MESSAGES.USER_ID_REQUIRED)
    const user = await this.getUserUseCase.execute(id)
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND)
    }
    success(res, user, HTTP_STATUS.OK, SUCCESS_MESSAGES.USER_RETRIEVED_SUCCESS)
  }

  updateUser = async (req: Request, res: Response) => {
    const { id } = req.params
    if (!id) throw new NotFoundError(ERROR_MESSAGES.USER_ID_REQUIRED)
    const user = await this.updateUserUseCase.execute(id, req.body)
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND)
    }
    success(res, user, HTTP_STATUS.OK, SUCCESS_MESSAGES.USER_UPDATED_SUCCESS)
  }
}
