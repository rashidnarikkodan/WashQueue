import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { ILogoutUseCase } from "../interfaces/auth-usecases.interfaces"

export class LogoutUseCase implements ILogoutUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    // Replace generic update with descriptive method
    await this.userRepository.clearRefreshToken(userId)
  }
}
