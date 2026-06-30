import { User } from "../../domain/entities/User"
import { PaginationMeta } from "@/shared/types/pagination"

export interface GetUsersQuery {
  page: number
  limit: number
  search?: string
  role?: "customer" | "provider" | "manager" | "admin"
  isBlocked?: boolean
  sortBy: "createdAt" | "name" | "email"
  sortOrder: "asc" | "desc"
}

export interface GetUsersResponse {
  users: User[]
  pagination: PaginationMeta
  stats?: {
    total: number
    active: number
    blocked: number
    providers: number
  }
}
