import { AppError } from "@/common/errors/app-error"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IRefreshTokenRepository } from "../../domain/repositories/refresh-token.repository"
import { RefreshToken } from "../../domain/entities/refresh-token.entity"
import { TokenPayloadMapper } from "../mappers/token-payload.mapper"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { IHashService, IRefreshTokenUseCase, ITokenService } from "../interfaces"

import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"

export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenService: ITokenService,
    private readonly hashService: IHashService,
    private readonly ownerRepository?: IOwnerRepository
  ) {}

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

      // Verify incoming refresh token against hashed refresh token stored in DB using repository and entity
      const activeToken = await this.refreshTokenRepository.findByUserId(user.id!)
      if (!activeToken) {
        throw new UnauthorizedError(ERROR_MESSAGES.INVALID_OR_EXPIRED_REFRESH_TOKEN)
      }

      const isTokenValid = await activeToken.verify(refreshToken, this.hashService)
      if (!isTokenValid) {
        throw new UnauthorizedError(ERROR_MESSAGES.INVALID_OR_EXPIRED_REFRESH_TOKEN)
      }

      // Map payload and generate tokens
      const tokenPayload = await TokenPayloadMapper.toTokenPayload(user, this.ownerRepository)

      const newAccessToken = this.tokenService.generateAccessToken(tokenPayload)
      const newRefreshToken = this.tokenService.generateRefreshToken(tokenPayload)

      // Hash the new refresh token for safe storage
      const hashedNewRefreshToken = await this.hashService.hash(newRefreshToken)

      // Save hashed refresh token
      await this.refreshTokenRepository.save(user.id!, new RefreshToken(hashedNewRefreshToken))

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_OR_EXPIRED_REFRESH_TOKEN)
    }
  }
}
