import { Request, Response } from "express";
import { GetUsers } from "../application/use-cases/get-users";
import { GetUser } from "../application/use-cases/get-user";
import { UpdateUser } from "../application/use-cases/update-user";
import { DeleteUser } from "../application/use-cases/delete-user";
import { usersQuerySchema } from "../application/schema/get-users.schema";
import response from "@/shared/utils/response";
import { HTTP_STATUS } from "@/shared/constants/http.constants";
import { NotFoundError } from "@/shared/errors/not-found-error";

export class UserController {
    constructor(
        private readonly GetUsersUseCase: GetUsers,        
        private readonly GetUserUseCase: GetUser,        
        private readonly UpdateUserUseCase: UpdateUser,        
        private readonly DeleteUserUseCase: DeleteUser,        
    ) {}

    getUsers = async (req: Request, res: Response) => {
        const query = usersQuerySchema.parse(req.query);
        const data = await this.GetUsersUseCase.execute(query);
        res.status(HTTP_STATUS.OK).json(response(data, "Users retrieved successfully"));
    }

    getUser = async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new NotFoundError("User ID is required");
        const user = await this.GetUserUseCase.execute(id);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        res.status(HTTP_STATUS.OK).json(response(user, "User retrieved successfully"));
    }

    updateUser = async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new NotFoundError("User ID is required");
        const user = await this.UpdateUserUseCase.execute(id, req.body);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        res.status(HTTP_STATUS.OK).json(response(user, "User updated successfully"));
    }

    deleteUser = async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new NotFoundError("User ID is required");
        const deleted = await this.DeleteUserUseCase.execute(id);
        if (!deleted) {
            throw new NotFoundError("User not found");
        }
        res.status(HTTP_STATUS.OK).json(response({ success: true }, "User deleted successfully"));
    }
}