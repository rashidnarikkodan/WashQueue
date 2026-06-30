import { AppError } from "@/shared/errors/app-error"
import { UnauthorizedError } from "@/shared/errors/unauthorized-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { TokenService } from "../../infrastructure/services/token.service"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { ERROR_MESSAGES } from "@/shared/constants/error.constants"

import { IRefreshTokenUseCase } from "../interfaces/auth-usecases.interfaces"

export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService
  ) { }

  async execute(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedError(ERROR_MESSAGES.REFRESH_TOKEN_REQUIRED)
    }

    try {
      const decoded = this.tokenService.verifyRefreshToken(refreshToken)

      const user = await this.userRepository.findById(decoded.userId)
      if (!user) {
        throw new UnauthorizedError(ERROR_MESSAGES.USER_NOT_FOUND)
      }

      if (user.isBlocked) {
        throw new AppError(ERROR_MESSAGES.ACCOUNT_BLOCKED, HTTP_STATUS.FORBIDDEN)
      }

      if (user.refreshToken !== refreshToken) {
        throw new UnauthorizedError(ERROR_MESSAGES.INVALID_OR_EXPIRED_REFRESH_TOKEN)
      }

      const tokenPayload = {
        userId: user.id,
        role: user.role,
        email: user.email,
      }

      const newAccessToken = this.tokenService.generateAccessToken(tokenPayload)
      const newRefreshToken = this.tokenService.generateRefreshToken(tokenPayload)

      await this.userRepository.update(user.id, {
        refreshToken: newRefreshToken,
      })

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      }
    } catch {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_OR_EXPIRED_REFRESH_TOKEN)
    }
  }
}
