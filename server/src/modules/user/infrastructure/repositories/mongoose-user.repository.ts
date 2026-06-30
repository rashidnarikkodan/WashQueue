import { User as UserModel } from "../models/user.model"
import { User } from "../../domain/entities/User"
import { UserMapper } from "../mappers/user.mapper"
import { IUserRepository } from "../../domain/repositories/user.repository"
import { GetUsersQuery } from "../../application/schema/get-users.schema"
import { buildPaginationMeta, getPagination } from "@/shared/utils/pagination"
import { PaginationMeta } from "@/shared/types/pagination"

export class MongooseUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const userDoc = await UserModel.findById(id).exec()
    return userDoc ? UserMapper.toDomain(userDoc) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    // Normalise email search (lowercase)
    const userDoc = await UserModel.findOne({ email: email.toLowerCase() }).exec()
    return userDoc ? UserMapper.toDomain(userDoc) : null
  }

  async create(user: User): Promise<User> {
    const persistenceData = UserMapper.toPersistence(user)
    const newUser = new UserModel(persistenceData)
    const savedDoc = await newUser.save()
    return UserMapper.toDomain(savedDoc)
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    const persistenceData = UserMapper.toPersistence(user)
    const updatedDoc = await UserModel.findByIdAndUpdate(id, persistenceData, { new: true }).exec()
    return updatedDoc ? UserMapper.toDomain(updatedDoc) : null
  }

  async getAllUsers(query: GetUsersQuery): Promise<{
    users: User[]
    pagination: PaginationMeta
    stats?: {
      total: number
      active: number
      blocked: number
      providers: number
    }
  }> {
    const {
      page,
      limit,
      search,
      role,
      isBlocked,
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

    // sorting
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    }

    // pagination
    const { skip } = getPagination({page,limit})

    const [users, total, totalAll, active, blocked, providers] = await Promise.all([
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
      UserModel.countDocuments({ role: "provider" }).exec(),
    ])

    const paginationMetaData = buildPaginationMeta({
        total,
        page,
        limit,
      })

    const domainUsers = users.map((user) => UserMapper.toDomain(user))

    return {
      users: domainUsers,
      pagination: paginationMetaData,
      stats: {
        total: totalAll,
        active,
        blocked,
        providers,
      }
    }
  }

}
