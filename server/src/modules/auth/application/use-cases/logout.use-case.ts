import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"

export class LogoutUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      refreshToken: "",
    })
  }
}

