import { User } from "../entities/User"
import { RoleType } from "@/common/constants/role.constants"
import { IBaseRepository } from "@/core/domain/repository.interface"
import { GetUsersQuery, GetUsersResponse } from "../../application/dto/get-users.dto"

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User | null>
  recordLoginSuccess(userId: string, hashedRefreshToken: string, timestamp: Date): Promise<void>
  verifyUserAndSaveSession(userId: string, hashedRefreshToken: string): Promise<void>
  updateRefreshToken(userId: string, hashedRefreshToken: string): Promise<void>
  clearRefreshToken(userId: string): Promise<void>
  resetPassword(userId: string, passwordHash: string): Promise<void>
  updateRole(userId: string, role: RoleType): Promise<void>
  getAllUsers(query: GetUsersQuery): Promise<GetUsersResponse>
  toggleBookmark(userId: string, stationId: string): Promise<User | null>
}
