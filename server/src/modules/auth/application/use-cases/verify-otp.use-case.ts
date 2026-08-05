import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IOtpRepository } from "../../domain/repositories/otp.repository"
import { IRefreshTokenRepository } from "../../domain/repositories/refresh-token.repository"
import { RefreshToken } from "../../domain/entities/refresh-token.entity"
import { TokenPayloadMapper } from "../mappers/token-payload.mapper"
import { IHashService, IOtpService, ITokenService, IVerifyOtpUseCase } from "../interfaces"
import { AuthOutput, VerifyOtpInput } from "../dto"

import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"

export class VerifyOtpUseCase implements IVerifyOtpUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpRepository: IOtpRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly otpService: IOtpService,
    private readonly tokenService: ITokenService,
    private readonly hashService: IHashService,
    private readonly ownerRepository?: IOwnerRepository
  ) {}

  async execute(data: VerifyOtpInput): Promise<AuthOutput> {
    const otp = await this.otpRepository.findByEmail(data.email)
    if (!otp || !otp.verify(data.otp)) {
      throw new AppError(ERROR_MESSAGES.INVALID_OR_EXPIRED_OTP, HTTP_STATUS.BAD_REQUEST)
    }

    // Delete OTP after successful verification
    await this.otpRepository.delete(data.email)

    const user = await this.userRepository.findByEmail(data.email)
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }

    // Generate JWT tokens using the payload mapper
    const tokenPayload = await TokenPayloadMapper.toTokenPayload(user, this.ownerRepository)

    const accessToken = this.tokenService.generateAccessToken(tokenPayload)
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload)

    // Secure the refresh token by hashing it
    const hashedRefreshToken = await this.hashService.hash(refreshToken)

    // Verify user and save session
    await this.userRepository.update(user.id!, { isVerified: true })
    await this.refreshTokenRepository.save(user.id!, new RefreshToken(hashedRefreshToken))

    return {
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true,
        authProvider: user.authProvider,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    }
  }
}
