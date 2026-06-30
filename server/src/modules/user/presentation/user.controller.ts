import { Request, Response } from "express";
import { GetUsers } from "../application/use-cases/get-users";
import { GetUser } from "../application/use-cases/get-user";
import { UpdateUser } from "../application/use-cases/update-user";
import { usersQuerySchema } from "../application/schema/get-users.schema";
import success from "@/shared/utils/success";
import { HTTP_STATUS } from "@/shared/constants/http.constants";
import { NotFoundError } from "@/shared/errors/not-found-error";
import { SUCCESS_MESSAGES } from "@/shared/constants/app.constants";
import { ERROR_MESSAGES } from "@/shared/constants/error.constants";

export class UserController {
    constructor(
        private readonly GetUsersUseCase: GetUsers,        
        private readonly GetUserUseCase: GetUser,        
        private readonly UpdateUserUseCase: UpdateUser,        
    ) {}

    getUsers = async (req: Request, res: Response) => {
        const query = usersQuerySchema.parse(req.query);
        const data = await this.GetUsersUseCase.execute(query);
        success(res, data, HTTP_STATUS.OK, SUCCESS_MESSAGES.USERS_RETRIEVED_SUCCESS);
    }

    getUser = async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new NotFoundError(ERROR_MESSAGES.USER_ID_REQUIRED);
        const user = await this.GetUserUseCase.execute(id);
        if (!user) {
            throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
        }
        success(res, user, HTTP_STATUS.OK, SUCCESS_MESSAGES.USER_RETRIEVED_SUCCESS);
    }

    updateUser = async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new NotFoundError(ERROR_MESSAGES.USER_ID_REQUIRED);
        const user = await this.UpdateUserUseCase.execute(id, req.body);
        if (!user) {
            throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
        }
        success(res, user, HTTP_STATUS.OK, SUCCESS_MESSAGES.USER_UPDATED_SUCCESS);
    }
}