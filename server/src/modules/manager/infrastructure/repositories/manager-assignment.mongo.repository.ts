import { Types } from "mongoose"
import { ManagerAssignment } from "../../domain/entities/ManagerAssignment"
import {
  FindOwnerManagersFilter,
  IManagerAssignmentRepository,
} from "../../domain/repositories/manager-assignment.repository"
import { ManagerAssignmentModel } from "../models/manager-assignment.model"
import { ManagerAssignmentMapper } from "../mappers/manager-assignment.mapper"

import { Owner as OwnerModel } from "@/modules/owner/infrastructure/model/owner.model"

export class MongoManagerAssignmentRepository implements IManagerAssignmentRepository {
  async create(assignment: ManagerAssignment): Promise<ManagerAssignment> {
    const raw = ManagerAssignmentMapper.toPersistence(assignment)
    const doc = await ManagerAssignmentModel.create({
      managerUserId: new Types.ObjectId(assignment.managerUserId),
      stationId: new Types.ObjectId(assignment.stationId),
      ownerId: new Types.ObjectId(assignment.ownerId),
      permissions: raw.permissions,
      status: raw.status,
      assignedAt: raw.assignedAt,
    })
    return ManagerAssignmentMapper.toDomain(doc)
  }

  async findById(id: string): Promise<ManagerAssignment | null> {
    if (!Types.ObjectId.isValid(id)) return null
    const doc = await ManagerAssignmentModel.findById(id).exec()
    return doc ? ManagerAssignmentMapper.toDomain(doc) : null
  }

  async findByUserAndStation(userId: string, stationId: string): Promise<ManagerAssignment | null> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(stationId)) return null
    const doc = await ManagerAssignmentModel.findOne({
      managerUserId: new Types.ObjectId(userId),
      stationId: new Types.ObjectId(stationId),
    }).exec()
    return doc ? ManagerAssignmentMapper.toDomain(doc) : null
  }

  async findByUserId(userId: string): Promise<ManagerAssignment[]> {
    if (!Types.ObjectId.isValid(userId)) return []
    const docs = await ManagerAssignmentModel.find({
      managerUserId: new Types.ObjectId(userId),
    }).exec()
    return docs.map((doc) => ManagerAssignmentMapper.toDomain(doc))
  }

  async findByStationId(stationId: string): Promise<ManagerAssignment[]> {
    if (!Types.ObjectId.isValid(stationId)) return []
    const docs = await ManagerAssignmentModel.find({
      stationId: new Types.ObjectId(stationId),
    }).exec()
    return docs.map((doc) => ManagerAssignmentMapper.toDomain(doc))
  }

  async findByOwnerId(
    ownerId: string,
    filters?: FindOwnerManagersFilter
  ): Promise<{ assignments: ManagerAssignment[]; total: number }> {
    if (!Types.ObjectId.isValid(ownerId)) return { assignments: [], total: 0 }

    const ownerDoc = await OwnerModel.findOne({ userId: new Types.ObjectId(ownerId) }).exec()
    const ownerIds = [new Types.ObjectId(ownerId)]
    if (ownerDoc) {
      ownerIds.push(ownerDoc._id as Types.ObjectId)
    }

    const query: any = { ownerId: { $in: ownerIds } }

    if (filters?.stationId && Types.ObjectId.isValid(filters.stationId)) {
      query.stationId = new Types.ObjectId(filters.stationId)
    }

    if (filters?.status) {
      query.status = filters.status
    }

    const page = filters?.page && filters.page > 0 ? filters.page : 1
    const limit = filters?.limit && filters.limit > 0 ? filters.limit : 10
    const skip = (page - 1) * limit

    const [docs, total] = await Promise.all([
      ManagerAssignmentModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      ManagerAssignmentModel.countDocuments(query).exec(),
    ])

    return {
      assignments: docs.map((doc) => ManagerAssignmentMapper.toDomain(doc)),
      total,
    }
  }

  async update(assignment: ManagerAssignment): Promise<ManagerAssignment> {
    if (!assignment.id || !Types.ObjectId.isValid(assignment.id)) {
      throw new Error("Invalid assignment ID for update")
    }

    const doc = await ManagerAssignmentModel.findByIdAndUpdate(
      assignment.id,
      {
        $set: {
          permissions: assignment.permissions,
          status: assignment.status,
        },
      },
      { new: true }
    ).exec()

    if (!doc) throw new Error("Assignment not found for update")
    return ManagerAssignmentMapper.toDomain(doc)
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false
    const res = await ManagerAssignmentModel.findByIdAndDelete(id).exec()
    return !!res
  }
}
