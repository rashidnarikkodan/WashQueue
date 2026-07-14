import { PaginationMeta } from "@/shared/types/pagination";
import { User } from "../entities/User"
import { RoleType } from "@/shared/constants/role.constants";

interface UsersQuery{
    page: number;
    limit: number;
    sortBy: "createdAt" | "name" | "email";
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    role?: RoleType | undefined;
    isBlocked?: boolean | undefined;
}
export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(user: User): Promise<User>
  update(id: string, user: Partial<User> & Record<string, any>): Promise<User | null>
  getAllUsers(query:UsersQuery): Promise<{
    users: User[]
    pagination: PaginationMeta
    stats?: {
      total: number
      active: number
      blocked: number
      owners: number
    }
  }>
}
