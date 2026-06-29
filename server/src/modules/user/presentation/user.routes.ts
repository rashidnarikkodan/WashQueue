import { Router } from "express"
import { UserController } from "./user.controller";
import asyncHandler from "@/shared/utils/async-handler";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize } from "@/shared/middleware/authorize";
import { ROLE } from "@/shared/constants/role.constants";

export const createUsersRouter = (userController: UserController):Router => {
    const router = Router();

    router.get('/users', authenticate, authorize(ROLE.ADMIN), asyncHandler(userController.getUsers))
    
    return router
}