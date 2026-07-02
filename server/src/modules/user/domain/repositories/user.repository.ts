import { PaginationMeta } from "@/shared/types/pagination";
import { User } from "../entities/User"
import { RoleType } from "@/shared/constants/role.constants"

interface UsersQuery{
    page: number;
    limit: number;
    sortBy: "createdAt" | "name" | "email";
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    role?: "customer" | "admin" | "provider" | "manager" | undefined;
    isBlocked?: boolean | undefined;
}
export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(user: User): Promise<User>
  update(id: string, user: Partial<User>): Promise<User | null>
  recordLoginSuccess(userId: string, hashedRefreshToken: string, timestamp: Date): Promise<void>
  verifyUserAndSaveSession(userId: string, hashedRefreshToken: string): Promise<void>
  updateRefreshToken(userId: string, hashedRefreshToken: string): Promise<void>
  clearRefreshToken(userId: string): Promise<void>
  resetPassword(userId: string, passwordHash: string): Promise<void>
  updateRole(userId: string, role: RoleType): Promise<void>
  getAllUsers(query:UsersQuery): Promise<{
    users: User[]
    pagination: PaginationMeta
    stats?: {
      total: number
      active: number
      blocked: number
      providers: number
    }
  }>
}
