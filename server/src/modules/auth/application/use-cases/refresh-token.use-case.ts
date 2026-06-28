import { AppError } from "@/shared/errors/app-error"
import { UnauthorizedError } from "@/shared/errors/unauthorized-error"
import { IUserRepository } from "../../domain/repositories/user.repository"
import { TokenService } from "../services/token.service"

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService
  ) {}

  async execute(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token is required")
    }

    try {
      const decoded = this.tokenService.verifyRefreshToken(refreshToken)

      const user = await this.userRepository.findById(decoded.userId)
      if (!user) {
        throw new UnauthorizedError("User not found")
      }

      if (user.isBlocked) {
        throw new AppError("Account is blocked", 403)
      }

      if (user.refreshToken !== refreshToken) {
        throw new UnauthorizedError("Invalid or expired refresh token")
      }

      const tokenPayload = {
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
      }

      const newAccessToken = this.tokenService.generateAccessToken(tokenPayload)
      const newRefreshToken = this.tokenService.generateRefreshToken(tokenPayload)

      await this.userRepository.update(user._id.toString(), {
        refreshToken: newRefreshToken,
      })

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      }
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired refresh token")
    }
  }
}
