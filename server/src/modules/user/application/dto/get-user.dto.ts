import { AuthProvider } from "@/shared/constants/authProvider"
import { RoleType } from "@/shared/constants/role.constants"

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
}

