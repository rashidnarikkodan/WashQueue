import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IRefreshTokenRepository } from "../../domain/repositories/refresh-token.repository"
import { IHashService, IChangePasswordUseCase } from "../interfaces"
import { ChangePasswordInput } from "../dto"

export class ChangePasswordUseCase implements IChangePasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly hashService: IHashService
  ) {}

  async execute(userId: string, data: ChangePasswordInput): Promise<void> {
    if (!userId) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED)
    }

    if (!data.currentPassword || !data.currentPassword.trim()) {
      throw new AppError("Current password is required", HTTP_STATUS.BAD_REQUEST)
    }

    if (!data.newPassword || !data.newPassword.trim()) {
      throw new AppError("New password is required", HTTP_STATUS.BAD_REQUEST)
    }

    if (data.newPassword.length < 8) {
      throw new AppError("Password must be at least 8 characters", HTTP_STATUS.BAD_REQUEST)
    }

    if (data.currentPassword === data.newPassword) {
      throw new AppError("New password cannot be the same as current password", HTTP_STATUS.BAD_REQUEST)
    }

    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }

    if (user.isBlocked) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_BLOCKED, HTTP_STATUS.FORBIDDEN)
    }

    if (!user.password) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.BAD_REQUEST)
    }

    const isCurrentPasswordValid = await this.hashService.verify(user.password, data.currentPassword)
    if (!isCurrentPasswordValid) {
      throw new AppError("Incorrect current password", HTTP_STATUS.BAD_REQUEST)
    }

    // Additional check using argon2 verify to ensure new password is not structurally identical to current hash
    const isSameAsCurrent = await this.hashService.verify(user.password, data.newPassword)
    if (isSameAsCurrent) {
      throw new AppError("New password cannot be the same as current password", HTTP_STATUS.BAD_REQUEST)
    }

    // Hash the new password using Argon2
    const hashedPassword = await this.hashService.hash(data.newPassword)

    // Update password in database
    await this.userRepository.resetPassword(userId, hashedPassword)

    // Invalidate existing authentication refresh token sessions
    await this.refreshTokenRepository.clear(userId)
  }
}
