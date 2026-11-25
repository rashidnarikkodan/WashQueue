import { AppError } from "@/common/errors/app-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"

import { AuthUser } from "../dto"
import { IGetMeUseCase } from "../interfaces"
import { ROLE } from "@/common/constants/role.constants"
import { AuthDTOMapper } from "../mappers/auth-dto.mapper"

export class GetMeUseCase implements IGetMeUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly ownerRepository: IOwnerRepository
  ) {}

  async execute(userId: string): Promise<AuthUser> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }

    if (user.isBlocked) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_BLOCKED, HTTP_STATUS.FORBIDDEN)
    }

    let isVerified = user.isVerified
    let onboardingStep = 1
    let ownerId: string | undefined = undefined
    let isManager: boolean | undefined = undefined

    if (user.role === ROLE.OWNER) {
      const owner = await this.ownerRepository.findByUserId(userId)
      if (owner) {
        isVerified = owner.isVerified ?? false
        onboardingStep = owner.onboardingStep ?? 1
        ownerId = owner.id
        isManager = owner.isManager ?? false
      }
    }

    return AuthDTOMapper.toAuthUserDTO(user, {
      isVerified,
      onboardingStep,
      ownerId,
      isManager,
    })
  }
}
