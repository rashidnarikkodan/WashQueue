import { Response, NextFunction } from "express"
import { AuthenticatedRequest } from "./authenticate"
import { ForbiddenError } from "../errors/forbidden-error"
import { UnauthorizedError } from "../errors/unauthorized-error"
import { RoleType } from "../constants/role.constants"

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
