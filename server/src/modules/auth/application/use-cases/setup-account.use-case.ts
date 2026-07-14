import { AppError } from "@/common/errors/app-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { ROLE, RoleType } from "@/common/constants/role.constants"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { AuthOutput } from "../dto"
import { ISetupAccountUseCase, ITokenService } from "../interfaces"

import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { Owner } from "@/modules/owner/domain/entities/Owner"

export class SetupAccountUseCase implements ISetupAccountUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly ownerRepository: IOwnerRepository,
    private readonly tokenService: ITokenService
  ) {}

  async execute(userId: string, role: RoleType): Promise<AuthOutput> {
    if (role !== ROLE.CUSTOMER && role !== ROLE.OWNER) {
      throw new AppError(ERROR_MESSAGES.INVALID_ROLE, HTTP_STATUS.BAD_REQUEST)
    }

    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }

    // Generate JWT access & refresh tokens with the new role
    const tokenPayload = {
      userId: user.id!,
      role,
      email: user.email,
    }

    const accessToken = this.tokenService.generateAccessToken(tokenPayload)
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload)

    if (role === ROLE.OWNER) {
      const owner = new Owner({
        userId: user.id!,
        onboardingStep: 1,
        isVerified: false,
      })
      await this.ownerRepository.save(owner);
    }

    const updatedUser = await this.userRepository.update(userId, {
      role,
      refreshToken,
    })
    if (!updatedUser) {
      throw new AppError(ERROR_MESSAGES.ROLE_UPDATE_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    return {
      user: {
        id: updatedUser.id!,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isVerified: false,
        onboardingStep: role === ROLE.OWNER ? 1 : undefined,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    }
  }
}
