import { Types } from "mongoose"
import {
  ManagerInvitation,
  ManagerInvitationStatus,
} from "../../domain/entities/ManagerInvitation"
import { ManagerPermission } from "../../domain/entities/ManagerAssignment"
import { IManagerInvitation } from "../models/manager-invitation.model"

export class ManagerInvitationMapper {
  static toDomain(doc: IManagerInvitation): ManagerInvitation {
    return new ManagerInvitation({
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      stationId: doc.stationId.toString(),
      ownerId: doc.ownerId.toString(),
      permissions: doc.permissions as ManagerPermission[],
      token: doc.token,
      status: doc.status as ManagerInvitationStatus,
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })
  }

  static toPersistence(entity: ManagerInvitation): Partial<IManagerInvitation> {
    return {
      email: entity.email,
      name: entity.name,
      stationId: new Types.ObjectId(entity.stationId),
      ownerId: new Types.ObjectId(entity.ownerId),
      permissions: entity.permissions,
      token: entity.token,
      status: entity.status,
      expiresAt: entity.expiresAt,
    }
  }
}
