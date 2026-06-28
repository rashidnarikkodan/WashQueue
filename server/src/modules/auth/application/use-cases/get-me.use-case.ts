import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "../../domain/repositories/user.repository"

export class GetMeUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new AppError("User not found", 404)
    }

    if (user.isBlocked) {
      throw new AppError("Account is blocked", 403)
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        walletBalance: user.walletBalance,
        isVerified: user.isVerified,
      },
    }
  }
}
