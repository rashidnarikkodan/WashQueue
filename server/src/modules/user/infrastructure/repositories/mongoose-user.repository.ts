import { User as UserModel } from "../models/user.model"
import { User } from "../../domain/entities/User"
import { UserMapper } from "../mappers/user.mapper"
import { IUserRepository } from "../../domain/repositories/user.repository"
import { GetUsersQuery } from "../../application/schema/get-users.schema"
import { buildPaginationMeta, getPagination } from "@/shared/utils/pagination"
import { PaginationMeta } from "@/shared/types/pagination"
import { ROLE } from "@/shared/constants/role.constants"

export class MongooseUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const userDoc = await UserModel.findById(id).lean().exec()
    if (!userDoc) return null
    return UserMapper.toDomain(userDoc as any)
  }

  async findByEmail(email: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ email: email.toLowerCase() }).lean().exec()
    if (!userDoc) return null
    return UserMapper.toDomain(userDoc as any)
  }

  async create(user: User): Promise<User> {
    const persistenceData = UserMapper.toPersistence(user)
    const newUser = new UserModel(persistenceData)
    const savedDoc = await newUser.save()
    return UserMapper.toDomain(savedDoc)
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    const persistenceData = UserMapper.toPersistence(user)
    const updatedDoc = await UserModel.findByIdAndUpdate(id, persistenceData, { new: true }).lean().exec()
    if (!updatedDoc) return null
    return UserMapper.toDomain(updatedDoc as any)
  }

  async getAllUsers(query: GetUsersQuery): Promise<{
    users: User[]
    pagination: PaginationMeta
    stats?: {
      total: number
      active: number
      blocked: number
      owners: number
    }
  }> {
    const {
      page,
      limit,
      search,
      role,
      isBlocked,
      isVerified,
      sortBy,
      sortOrder,
    } = query

    const filter: Record<string, unknown> = {}

    // search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    // role filter
    if (role) {
      filter.role = role
    }

    // blocked filter
    if (typeof isBlocked === "boolean") {
      filter.isBlocked = isBlocked
    }

    // verified filter (query provider_profiles collection and query User matching userIds)
    if (typeof isVerified === "boolean") {
      const { ProviderProfile } = await import("@/modules/owner/infrastructure/models/owner.model")
      const ownersList = await ProviderProfile.find({ isVerified }).select("userId").lean().exec()
      const ownerUserIds = ownersList.map((o) => o.userId)
      filter._id = { $in: ownerUserIds }
    }

    // sorting
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    }

    // pagination
    const { skip } = getPagination({page,limit})

    const [users, total, totalAll, active, blocked, owners] = await Promise.all([
      UserModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select("-password")
        .lean()
        .exec(),

      UserModel.countDocuments(filter).exec(),
      UserModel.countDocuments({}).exec(),
      UserModel.countDocuments({ isBlocked: false }).exec(),
      UserModel.countDocuments({ isBlocked: true }).exec(),
      UserModel.countDocuments({ role: ROLE.OWNER }).exec(),
    ])

    const paginationMetaData = buildPaginationMeta({
        total,
        page,
        limit,
      })

    const domainUsers = users.map((user) => UserMapper.toDomain(user as any))

    return {
      users: domainUsers,
      pagination: paginationMetaData,
      stats: {
        total: totalAll,
        active,
        blocked,
        owners,
      }
    }
  }

}
