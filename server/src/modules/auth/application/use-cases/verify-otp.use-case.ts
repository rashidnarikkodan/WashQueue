import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { TokenPayloadMapper } from "../mappers/token-payload.mapper"
import { IHashService, IOtpService, ITokenService, IVerifyOtpUseCase } from "../interfaces"
import { AuthOutput, VerifyOtpInput } from "../dto"

export class VerifyOtpUseCase implements IVerifyOtpUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpService: IOtpService,
    private readonly tokenService: ITokenService,
    private readonly hashService: IHashService
  ) { }

  async execute(data: VerifyOtpInput): Promise<AuthOutput> {
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
    await this.userRepository.verifyUserAndSaveSession(user.id!, hashedRefreshToken)

    return {
      user: {
        id: user.id!,
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
