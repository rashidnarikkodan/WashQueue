import { PaginationMeta } from "@/common/types/pagination"
import { RoleType } from "@/common/constants/role.constants"

export interface UserSummaryDto {
  id: string
  name?: string
  email: string
  role: RoleType
  isVerified: boolean
  isBlocked: boolean
  avatar?: string
  lastLoginAt?: Date
  walletBalance?: number
  bookmarks?: string[]
  createdAt?: Date
  updatedAt?: Date
  onboardingStep?: number
  onboardingDetails?: Record<string, unknown>
}

export interface GetUsersQuery {
  page: number
  limit: number
  search?: string
  role?: RoleType
  isBlocked?: boolean
  isVerified?: boolean
  sortBy: "createdAt" | "name" | "email"
  sortOrder: "asc" | "desc"
}

export interface GetUsersResponse {
  users: UserSummaryDto[]
  pagination: PaginationMeta
  stats?: {
    total: number
    active: number
    blocked: number
    owners: number
  }
}
