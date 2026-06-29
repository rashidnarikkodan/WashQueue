import { IUser } from "../models/user.model"
import { User } from "../../domain/entities/User"

export class UserMapper {
  static toDomain(mongooseDoc: IUser): User {
    return new User({
      id: mongooseDoc._id.toString(),
      name: mongooseDoc.name,
      email: mongooseDoc.email,
      phone: mongooseDoc.phone,
      password: mongooseDoc.password,
      role: mongooseDoc.role,
      refreshToken: mongooseDoc.refreshToken,
      lastLoginAt: mongooseDoc.lastLoginAt,
      walletBalance: mongooseDoc.walletBalance,
      avatar: mongooseDoc.avatar,
      authProvider: mongooseDoc.authProvider,
      isBlocked: mongooseDoc.isBlocked,
      isVerified: mongooseDoc.isVerified,
      createdAt: mongooseDoc.createdAt,
      updatedAt: mongooseDoc.updatedAt,
    })
  }

  static toPersistence(domainEntity: Partial<User>): Partial<IUser> {
    const raw: Partial<IUser> = {
      name: domainEntity.name,
      email: domainEntity.email,
      phone: domainEntity.phone,
      password: domainEntity.password,
      role: domainEntity.role,
      refreshToken: domainEntity.refreshToken,
      lastLoginAt: domainEntity.lastLoginAt,
      walletBalance: domainEntity.walletBalance,
      avatar: domainEntity.avatar,
      authProvider: domainEntity.authProvider,
      isBlocked: domainEntity.isBlocked,
      isVerified: domainEntity.isVerified,
    }
    return raw
  }
}
