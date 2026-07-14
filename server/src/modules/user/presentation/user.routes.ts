import { Router } from "express"
import { UserController } from "./user.controller";
import asyncHandler from "@/common/utils/async-handler";
import { authenticate } from "@/infrastructure/http/middleware/authenticate";
import { authorize } from "@/infrastructure/http/middleware/authorize";
import { ROLE } from "@/common/constants/role.constants";
import { API_ROUTES } from "@/common/constants/route.constants";
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware";
import { updateOwnerSchema } from "@/modules/owner/presentation/schema/owner.schema";

export const createUsersRouter = (userController: UserController): Router => {
    const router = Router();

    router.get(API_ROUTES.USERS.GET_ALL, authenticate, authorize(ROLE.ADMIN), asyncHandler(userController.getUsers))
    router.get(API_ROUTES.USERS.GET_BY_ID, authenticate, authorize(ROLE.ADMIN), asyncHandler(userController.getUser))
    router.patch(API_ROUTES.USERS.UPDATE, authenticate, authorize(ROLE.ADMIN), validateRequest(updateOwnerSchema,'body'), asyncHandler(userController.updateUser))
    
    return router
}