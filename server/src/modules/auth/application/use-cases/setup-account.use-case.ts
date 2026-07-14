import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { ROLE, RoleType } from "@/shared/constants/role.constants"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { ERROR_MESSAGES } from "@/shared/constants/error.constants"
import { TokenService } from "../../infrastructure/services/token.service"

import { ISetupAccountUseCase } from "../interfaces/auth-usecases.interfaces"

import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { Owner } from "@/modules/owner/domain/entities/Owner"

export class SetupAccountUseCase implements ISetupAccountUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly ownerRepository: IOwnerRepository,
    private readonly tokenService: TokenService
  ) {}

  async execute(userId: string, role: RoleType) {

    if (role !== ROLE.CUSTOMER && role !== ROLE.OWNER) {
      throw new AppError(ERROR_MESSAGES.INVALID_ROLE, HTTP_STATUS.BAD_REQUEST)
    }

    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }

    // Generate JWT access & refresh tokens with the new role
    const tokenPayload = {
      userId: user.id,
      role,
      email: user.email,
    }

    const accessToken = this.tokenService.generateAccessToken(tokenPayload)
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload)

    if (role === ROLE.OWNER) {
      const owner = new Owner({
        id: user.id,
        email: user.email,
        role: "owner",
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
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role, // Return client-compatible role representation
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
