import type { RoleType } from "../../../shared/constants/role.const";

export interface AuthUser {
    id: string
    name?: string
    email: string
    role: RoleType
    avatar?: string
    isNewUser?: boolean
    isVerified: boolean
}