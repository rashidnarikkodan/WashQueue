import { AuthProvider } from "@/common/constants/authProvider"
import { RoleType } from "@/common/constants/role.constants"

export interface UserProfileDto {
        id?: string
        name?: string
        email: string
        phone?: string
        role: RoleType
        lastLoginAt?: Date
        walletBalance?: number
        avatar?: string
        authProvider?: AuthProvider
        isBlocked?: boolean
        isVerified?: boolean
        createdAt?: Date
        updatedAt?: Date
        onboardingStep?: number
        onboardingDetails?: Record<string, unknown>
}

