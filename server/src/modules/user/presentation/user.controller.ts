import { Request, Response } from "express";
import { GetUsers } from "../application/use-cases/get-users";
import { usersQuerySchema } from "../application/schema/get-users.schema";
import response from "@/shared/utils/response";
import { HTTP_STATUS } from "@/shared/constants/http.constants";

export class UserController {
    constructor(
        private readonly GetUsersUseCase: GetUsers,        
    ) {}

    getUsers = async (req: Request, res: Response) => {
        const query = usersQuerySchema.parse(req.query);
        const data = await this.GetUsersUseCase.execute(query);
        res.status(HTTP_STATUS.OK).json(response(data, "Users retrieved successfully"));
    }
}