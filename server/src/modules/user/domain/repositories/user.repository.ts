import { PaginationMeta } from "@/shared/types/pagination";
import { User } from "../entities/User"

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
  delete(id: string): Promise<boolean>
  getAllUsers(query:UsersQuery): Promise<{users:User[],pagination:PaginationMeta}>
}
