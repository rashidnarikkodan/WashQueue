import { Router } from "express"
import { UserController } from "./user.controller";
import asyncHandler from "@/shared/utils/async-handler";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize } from "@/shared/middleware/authorize";
import { ROLE } from "@/shared/constants/role.constants";
import { API_ROUTES } from "@/shared/constants/route.constants";

export const createUsersRouter = (userController: UserController): Router => {
    const router = Router();

    router.get(API_ROUTES.USERS.GET_ALL, authenticate, authorize(ROLE.ADMIN), asyncHandler(userController.getUsers))
    router.get(API_ROUTES.USERS.GET_BY_ID, authenticate, authorize(ROLE.ADMIN), asyncHandler(userController.getUser))
    router.patch(API_ROUTES.USERS.UPDATE, authenticate, authorize(ROLE.ADMIN), asyncHandler(userController.updateUser))
    
    return router
}