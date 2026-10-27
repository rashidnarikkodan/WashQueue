import { User } from "../../domain/entities/User"
import { UserProfileDto } from "../dto/get-user.dto"
import { GetUsersResponse } from "../dto/get-users.dto"
import type { RoleType } from "@/common/constants/role.constants"

export interface UserDTO {
  id: string
  name?: string
  email: string
  phone?: string
  role: RoleType
  avatar?: string
  isBlocked: boolean
  isVerified: boolean
  authProvider?: string
  lastLoginAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export class UserDTOMapper {
  static toDTO(user: User): UserDTO {
    return {
      id: user.id ?? "",
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      isBlocked: user.isBlocked,
      isVerified: user.isVerified,
      authProvider: user.authProvider,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  static toProfileDTO(
    user: User,
    ownerData?: {
      isVerified?: boolean
      onboardingStep?: number
      onboardingDetails?: Record<string, unknown>
    }
  ): UserProfileDto {
    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isBlocked: user.isBlocked,
      lastLoginAt: user.lastLoginAt,
      walletBalance: user.walletBalance ?? 0,
      authProvider: user.authProvider,
      isVerified: ownerData?.isVerified ?? user.isVerified,
      onboardingStep: ownerData?.onboardingStep,
      onboardingDetails: ownerData?.onboardingDetails,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  static toListResponse(response: GetUsersResponse): GetUsersResponse {
    return {
      users: response.users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        isVerified: u.isVerified,
        isBlocked: u.isBlocked,
        avatar: u.avatar,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        onboardingStep: u.onboardingStep,
        onboardingDetails: u.onboardingDetails,
      })),
      pagination: response.pagination,
      stats: response.stats,
    }
  }
}
