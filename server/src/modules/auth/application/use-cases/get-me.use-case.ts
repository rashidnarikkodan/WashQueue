import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { ERROR_MESSAGES } from "@/shared/constants/error.constants"
import { IGetMeUseCase } from "../interfaces/auth-usecases.interfaces"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"

export class GetMeUseCase implements IGetMeUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly ownerRepository: IOwnerRepository,
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }

    if (user.isBlocked) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_BLOCKED, HTTP_STATUS.FORBIDDEN)
    }

    let isVerified = false
    let onboardingStep = 1

    if (user.role === "owner") {
      const owner = await this.ownerRepository.findByUserId(userId)
      if (owner) {
        isVerified = owner.isVerified
        onboardingStep = owner.onboardingStep
      }
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
        isVerified,
        onboardingStep,
      },
    }
  }
}
