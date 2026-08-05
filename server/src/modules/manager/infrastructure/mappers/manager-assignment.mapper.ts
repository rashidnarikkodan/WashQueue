import { Types } from "mongoose"
import {
  ManagerAssignment,
  ManagerAssignmentStatus,
  ManagerPermission,
} from "../../domain/entities/ManagerAssignment"
import { IManagerAssignment } from "../models/manager-assignment.model"

export class ManagerAssignmentMapper {
  static toDomain(doc: IManagerAssignment): ManagerAssignment {
    return new ManagerAssignment({
      id: doc._id.toString(),
      managerUserId: doc.managerUserId.toString(),
      stationId: doc.stationId.toString(),
      ownerId: doc.ownerId.toString(),
      permissions: doc.permissions as ManagerPermission[],
      status: doc.status as ManagerAssignmentStatus,
      assignedAt: doc.assignedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })
  }

  static toPersistence(entity: ManagerAssignment): Partial<IManagerAssignment> {
    return {
      managerUserId: new Types.ObjectId(entity.managerUserId),
      stationId: new Types.ObjectId(entity.stationId),
      ownerId: new Types.ObjectId(entity.ownerId),
      permissions: entity.permissions,
      status: entity.status,
      assignedAt: entity.assignedAt,
    }
  }
}
