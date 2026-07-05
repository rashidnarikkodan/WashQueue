import { User as UserModel, IUser } from "../model/user.model"
import { User } from "../../domain/entities/User"
import { UserMapper } from "../mappers/user.mapper"
import { IUserRepository } from "../../domain/repositories/user.repository"
import { GetUsersQuery, GetUsersResponse } from "../../application/dto/get-users.dto"
import { buildPaginationMeta, getPagination } from "@/shared/utils/pagination"
import { RoleType, ROLE } from "@/shared/constants/role.constants"
import { BaseRepository } from "@/shared/infrastructure/database/repository/base.repository"

export class UserRepository extends BaseRepository<User, IUser> implements IUserRepository {
  constructor() {
    super(UserModel, new UserMapper())
  }

  async findByEmail(email: string): Promise<User | null> {
    // Normalise email search (lowercase)
    const userDoc = await this.model.findOne({ email: email.toLowerCase() }).exec()
    return userDoc ? this.mapper.toDomain(userDoc) : null
  }
  async recordLoginSuccess(userId: string, hashedRefreshToken: string, timestamp: Date): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          refreshToken: hashedRefreshToken,
          lastLoginAt: timestamp,
        },
      }
    ).exec()
  }

  async verifyUserAndSaveSession(userId: string, hashedRefreshToken: string): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          isVerified: true,
          refreshToken: hashedRefreshToken,
        },
      }
    ).exec()
  }

  async updateRefreshToken(userId: string, hashedRefreshToken: string): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          refreshToken: hashedRefreshToken,
        },
      }
    ).exec()
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          refreshToken: "",
        },
      }
    ).exec()
  }

  async resetPassword(userId: string, passwordHash: string): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          password: passwordHash,
          isVerified: true,
        },
      }
    ).exec()
  }

  async updateRole(userId: string, role: RoleType): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          role,
        },
      }
    ).exec()
  }



  async getAllUsers(query: GetUsersQuery): Promise<GetUsersResponse> {
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
    const { skip } = getPagination({ page, limit })

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
      UserModel.countDocuments({ role: ROLE.PROVIDER }).exec(),
    ])

    const paginationMetaData = buildPaginationMeta({
      total,
      page,
      limit,
    })

    const domainUsers = users.map((user) => UserMapper.toUserSummaryDto(this.mapper.toDomain(user)))

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
