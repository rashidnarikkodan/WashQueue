import { IRefreshTokenRepository } from "../../domain/repositories/refresh-token.repository"
import { ILogoutUseCase } from "../interfaces"

export class LogoutUseCase implements ILogoutUseCase {
  constructor(private readonly refreshTokenRepository: IRefreshTokenRepository) {}

  async execute(userId: string): Promise<void> {
    await this.refreshTokenRepository.clear(userId)
  }
}
