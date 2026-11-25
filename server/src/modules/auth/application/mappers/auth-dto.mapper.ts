import { User } from "@/modules/user/domain/entities/User"
import { AuthUser } from "../dto/common/auth-user.dto"

export class AuthDTOMapper {
  static toAuthUserDTO(
    user: User,
    options?: {
      isVerified?: boolean
      onboardingStep?: number
      ownerId?: string
      isManager?: boolean
      isNewUser?: boolean
    }
  ): AuthUser {
    return {
      id: user.id ?? "",
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      walletBalance: user.walletBalance ?? 0,
      isVerified: options?.isVerified ?? user.isVerified ?? false,
      onboardingStep: options?.onboardingStep,
      authProvider: user.authProvider,
      ownerId: options?.ownerId,
      isManager: options?.isManager,
      isNewUser: options?.isNewUser,
    }
  }
}
