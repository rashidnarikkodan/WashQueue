import { Response, NextFunction } from "express"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { ManagerPermission } from "../../domain/entities/ManagerAssignment"
import { IManagerAssignmentRepository } from "../../domain/repositories/manager-assignment.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { Owner as OwnerModel } from "@/modules/owner/infrastructure/model/owner.model"
import { Types } from "mongoose"

export const createRequireManagerPermissionMiddleware = (
  managerAssignmentRepository: IManagerAssignmentRepository,
  stationRepository: IStationRepository
) => {
  return (requiredPermission?: ManagerPermission) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new UnauthorizedError("Authentication required")
        }

        const stationId =
          req.params.stationId ||
          (req.headers["x-station-id"] as string) ||
          (req.query.stationId as string)

        if (!stationId) {
          throw new ForbiddenError("Station context is required for manager authorization")
        }

        // Check if user is station owner (Owners have implicit full access to their stations)
        const station = await stationRepository.findById(stationId)
        if (station) {
          const ownerDoc = await OwnerModel.findOne({ userId: new Types.ObjectId(req.user.userId) }).exec()
          const isOwner =
            station.ownerId.toString() === req.user.userId ||
            (ownerDoc && station.ownerId.toString() === ownerDoc._id.toString())

          if (isOwner) {
            return next()
          }
        }

        // Check Manager Assignment
        const assignment = await managerAssignmentRepository.findByUserAndStation(
          req.user.userId,
          stationId
        )

        if (!assignment) {
          throw new ForbiddenError("You do not have a manager assignment for this station")
        }

        if (!assignment.isActive) {
          throw new ForbiddenError("Your manager assignment for this station is suspended")
        }

        if (requiredPermission && !assignment.hasPermission(requiredPermission)) {
          throw new ForbiddenError(
            `Insufficient permission. Required: ${requiredPermission}`
          )
        }

        next()
      } catch (error) {
        next(error)
      }
    }
  }
}
