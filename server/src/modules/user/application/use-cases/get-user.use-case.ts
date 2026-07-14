import { IUserRepository } from "../../domain/repositories/user.repository"
import { UserProfileDto } from "../dto"
import { IGetUserUseCase } from "../interfaces"

export class GetUserUseCase implements IGetUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
  ) { }

  async execute(id: string): Promise<UserProfileDto | null> {
    const user = await this.userRepository.findById(id)

    if (!user) {
      return null
    }

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isBlocked: user.isBlocked,
      lastLoginAt: user.lastLoginAt,
      walletBalance: user.walletBalance,
      createdAt: user.createdAt,
      authProvider: user.authProvider,
      isVerified: user.isVerified,
      updatedAt: user.updatedAt
    }
  }
}