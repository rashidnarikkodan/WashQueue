import { AppError } from "@/common/errors/app-error"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { TokenPayloadMapper } from "../mappers/token-payload.mapper"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { IHashService, IRefreshTokenUseCase, ITokenService } from "../interfaces"


export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly hashService: IHashService
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

      // Verify incoming refresh token against hashed refresh token stored in DB
      if (!user.refreshToken) {
        throw new UnauthorizedError(ERROR_MESSAGES.INVALID_OR_EXPIRED_REFRESH_TOKEN)
      }

      const isTokenValid = await this.hashService.verify(user.refreshToken, refreshToken)
      if (!isTokenValid) {
        throw new UnauthorizedError(ERROR_MESSAGES.INVALID_OR_EXPIRED_REFRESH_TOKEN)
      }

      // Map payload and generate tokens
      const tokenPayload = TokenPayloadMapper.toTokenPayload(user)

      const newAccessToken = this.tokenService.generateAccessToken(tokenPayload)
      const newRefreshToken = this.tokenService.generateRefreshToken(tokenPayload)

      // Hash the new refresh token for safe storage
      const hashedNewRefreshToken = await this.hashService.hash(newRefreshToken)

      // Save hashed refresh token to user session atomically
      await this.userRepository.updateRefreshToken(user.id!, hashedNewRefreshToken)

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
