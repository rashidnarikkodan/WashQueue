import { Response, NextFunction } from "express"
import { AuthenticatedRequest } from "./authenticate"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import { RoleType } from "@/common/constants/role.constants"
import { AppError } from "@/common/errors/app-error"

export const authorize = (...allowedRoles: RoleType[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required")
    }

    if (!allowedRoles.includes(req.user.role as RoleType)) {
      throw new ForbiddenError("Access denied - Insufficient permissions")
    }

    next()
  }
}
