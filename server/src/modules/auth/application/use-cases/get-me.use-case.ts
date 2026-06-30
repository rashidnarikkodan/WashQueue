import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { ERROR_MESSAGES } from "@/shared/constants/error.constants"

import { IGetMeUseCase } from "../interfaces/auth-usecases.interfaces"

export class GetMeUseCase implements IGetMeUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }

    if (user.isBlocked) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_BLOCKED, HTTP_STATUS.FORBIDDEN)
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
