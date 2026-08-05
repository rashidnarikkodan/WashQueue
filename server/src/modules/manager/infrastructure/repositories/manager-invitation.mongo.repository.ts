import { Types } from "mongoose"
import { ManagerInvitation } from "../../domain/entities/ManagerInvitation"
import { IManagerInvitationRepository } from "../../domain/repositories/manager-invitation.repository"
import { ManagerInvitationModel } from "../models/manager-invitation.model"
import { ManagerInvitationMapper } from "../mappers/manager-invitation.mapper"

import { Owner as OwnerModel } from "@/modules/owner/infrastructure/model/owner.model"

export class MongoManagerInvitationRepository implements IManagerInvitationRepository {
  async create(invitation: ManagerInvitation): Promise<ManagerInvitation> {
    const doc = await ManagerInvitationModel.create({
      email: invitation.email,
      name: invitation.name,
      stationId: new Types.ObjectId(invitation.stationId),
      ownerId: new Types.ObjectId(invitation.ownerId),
      permissions: invitation.permissions,
      token: invitation.token,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
    })
    return ManagerInvitationMapper.toDomain(doc)
  }

  async findById(id: string): Promise<ManagerInvitation | null> {
    if (!Types.ObjectId.isValid(id)) return null
    const doc = await ManagerInvitationModel.findById(id).exec()
    return doc ? ManagerInvitationMapper.toDomain(doc) : null
  }

  async findByToken(token: string): Promise<ManagerInvitation | null> {
    const doc = await ManagerInvitationModel.findOne({ token }).exec()
    return doc ? ManagerInvitationMapper.toDomain(doc) : null
  }

  async findByEmailAndStation(email: string, stationId: string): Promise<ManagerInvitation | null> {
    if (!Types.ObjectId.isValid(stationId)) return null
    const doc = await ManagerInvitationModel.findOne({
      email: email.toLowerCase().trim(),
      stationId: new Types.ObjectId(stationId),
      status: "PENDING",
    }).exec()
    return doc ? ManagerInvitationMapper.toDomain(doc) : null
  }

  async findPendingByEmail(email: string): Promise<ManagerInvitation | null> {
    const doc = await ManagerInvitationModel.findOne({
      email: email.toLowerCase().trim(),
      status: "PENDING",
      expiresAt: { $gt: new Date() },
    }).exec()
    return doc ? ManagerInvitationMapper.toDomain(doc) : null
  }

  async findByOwnerId(ownerId: string): Promise<ManagerInvitation[]> {
    if (!Types.ObjectId.isValid(ownerId)) return []
    const ownerDoc = await OwnerModel.findOne({ userId: new Types.ObjectId(ownerId) }).exec()
    const ownerIds = [new Types.ObjectId(ownerId)]
    if (ownerDoc) {
      ownerIds.push(ownerDoc._id as Types.ObjectId)
    }

    const docs = await ManagerInvitationModel.find({
      ownerId: { $in: ownerIds },
    })
      .sort({ createdAt: -1 })
      .exec()
    return docs.map((doc) => ManagerInvitationMapper.toDomain(doc))
  }

  async findByStationId(stationId: string): Promise<ManagerInvitation[]> {
    if (!Types.ObjectId.isValid(stationId)) return []
    const docs = await ManagerInvitationModel.find({
      stationId: new Types.ObjectId(stationId),
    })
      .sort({ createdAt: -1 })
      .exec()
    return docs.map((doc) => ManagerInvitationMapper.toDomain(doc))
  }

  async update(invitation: ManagerInvitation): Promise<ManagerInvitation> {
    if (!invitation.id || !Types.ObjectId.isValid(invitation.id)) {
      throw new Error("Invalid invitation ID for update")
    }

    const doc = await ManagerInvitationModel.findByIdAndUpdate(
      invitation.id,
      {
        $set: {
          status: invitation.status,
          token: invitation.token,
          expiresAt: invitation.expiresAt,
        },
      },
      { new: true }
    ).exec()

    if (!doc) throw new Error("Invitation not found for update")
    return ManagerInvitationMapper.toDomain(doc)
  }
}
