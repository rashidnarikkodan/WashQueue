import { User as UserModel, IUser } from "../model/user.model"
import { User } from "../../domain/entities/User"
import { UserMapper } from "../mappers/user.mapper"
import { IUserRepository } from "../../domain/repositories/user.repository"
import { GetUsersQuery, GetUsersResponse } from "../../application/dto/get-users.dto"
import { buildPaginationMeta, getPagination } from "@/common/utils/pagination"
import { RoleType, ROLE } from "@/common/constants/role.constants"
import { BaseRepository } from "@/infrastructure/database/repository/base.repository"

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
      isVerified,
      sortBy,
      sortOrder,
    } = query

    const filter: Record<string, unknown> = {}

    // verified filter
    if (typeof isVerified === "boolean") {
      const { Owner: OwnerModel } = await import("@/modules/owner/infrastructure/model/owner.model")
      const ownersList = await OwnerModel.find({ isVerified }).select("userId").lean().exec()
      const ownerUserIds = ownersList.map((o) => o.userId)
      filter._id = { $in: ownerUserIds }
    }

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

    const domainUsers = users.map((user) => UserMapper.toUserSummaryDto(this.mapper.toDomain(user)))

    // Resolve owner onboarding details & verification status for users with OWNER role
    const { Owner: OwnerModel } = await import("@/modules/owner/infrastructure/model/owner.model")
    const ownerUserIds = domainUsers.filter((u) => u.role === ROLE.OWNER).map((u) => u.id)
    if (ownerUserIds.length > 0) {
      const ownersList = await OwnerModel.find({ userId: { $in: ownerUserIds } }).lean().exec()
      const ownersMap = new Map(ownersList.map((o) => [o.userId.toString(), o]))
      
      domainUsers.forEach((u) => {
        if (u.role === ROLE.OWNER) {
          const ownerDoc = ownersMap.get(u.id)
          u.isVerified = ownerDoc ? (ownerDoc.isVerified ?? false) : false
          u.onboardingStep = ownerDoc ? (ownerDoc.onboardingStep ?? 1) : 1
          if (ownerDoc) {
            u.onboardingDetails = {
              fullName: ownerDoc.legalFullName,
              businessName: ownerDoc.businessName,
              phone: ownerDoc.phone,
              whatsapp: ownerDoc.whatsapp,
              gstNumber: ownerDoc.gstNumber,
              idProofType: ownerDoc.idProofType,
              idProofUrl: ownerDoc.idProofUrl,
              businessLicenseUrl: ownerDoc.businessLicenseUrl,
              gstCertificateUrl: ownerDoc.gstCertificateUrl,
              accountHolderName: ownerDoc.accountHolderName,
              bankName: ownerDoc.bankName,
              accountNumber: ownerDoc.accountNumber,
              ifscCode: ownerDoc.ifscCode,
              bankProofUrl: ownerDoc.bankProofUrl,
              rejectionReason: ownerDoc.rejectionReason,
            }
          }
        }
      })
    }

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
