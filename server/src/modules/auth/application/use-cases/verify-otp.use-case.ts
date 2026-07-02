import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IOtpService } from "../interfaces/otp-service.interface"
import { ITokenService } from "../interfaces/token-service.interface"
import { IHashService } from "../interfaces/hash-service.interface"
import { TokenPayloadMapper } from "../mappers/token-payload.mapper"
import { VerifyOtpInput, VerifyOtpResponse } from "../dto/verify-otp.dto"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { ERROR_MESSAGES } from "@/shared/constants/error.constants"
import { IVerifyOtpUseCase } from "../interfaces/auth-usecases.interfaces"

export class VerifyOtpUseCase implements IVerifyOtpUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpService: IOtpService,
    private readonly tokenService: ITokenService,
    private readonly hashService: IHashService
  ) { }

  async execute(data: VerifyOtpInput): Promise<VerifyOtpResponse> {
    const isOtpValid = await this.otpService.verifyOtp(data.email, data.otp)
    if (!isOtpValid) {
      throw new AppError(ERROR_MESSAGES.INVALID_OR_EXPIRED_OTP, HTTP_STATUS.BAD_REQUEST)
    }

    const user = await this.userRepository.findByEmail(data.email)
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }

    // Generate JWT tokens using the payload mapper
    const tokenPayload = TokenPayloadMapper.toTokenPayload(user)

    const accessToken = this.tokenService.generateAccessToken(tokenPayload)
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload)

    // Secure the refresh token by hashing it
    const hashedRefreshToken = await this.hashService.hash(refreshToken)

    // Verify user and save session atomically
    await this.userRepository.verifyUserAndSaveSession(user.id, hashedRefreshToken)

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
