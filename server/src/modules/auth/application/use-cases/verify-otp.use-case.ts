import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { OtpService } from "../services/otp.service"
import { TokenService } from "../services/token.service"
import { VerifyOtpInput } from "../schema/verify-otp.schema"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { ERROR_MESSAGES } from "@/shared/constants/error.constants"

import { IVerifyOtpUseCase } from "../interfaces/auth-usecases.interfaces"

export class VerifyOtpUseCase implements IVerifyOtpUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpService: OtpService,
    private readonly tokenService: TokenService
  ) {}

  async execute(data: VerifyOtpInput) {
    const isOtpValid = await this.otpService.verifyOtp(data.email, data.otp)
    if (!isOtpValid) {
      throw new AppError(ERROR_MESSAGES.INVALID_OR_EXPIRED_OTP, HTTP_STATUS.BAD_REQUEST)
    }

    const user = await this.userRepository.findByEmail(data.email)
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }

    // Generate JWT tokens
    const tokenPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
    }

    const accessToken = this.tokenService.generateAccessToken(tokenPayload)
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload)

    // Save refresh token to user document and set isVerified to true
    await this.userRepository.update(user.id, {
      isVerified: true,
      refreshToken,
    })

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    }
  }
}
