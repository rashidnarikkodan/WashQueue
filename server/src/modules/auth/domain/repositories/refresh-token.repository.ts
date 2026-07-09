import { RefreshToken } from "../entities/refresh-token.entity"

export interface IRefreshTokenRepository {
  save(userId: string, token: RefreshToken): Promise<void>
  findByUserId(userId: string): Promise<RefreshToken | null>
  clear(userId: string): Promise<void>
}
