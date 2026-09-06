import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { AUTH_PROVIDER } from "@/common/constants/authProvider"

import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IRefreshTokenRepository } from "../../domain/repositories/refresh-token.repository"
import { RefreshToken } from "../../domain/entities/refresh-token.entity"
import { TokenPayloadMapper } from "../mappers/token-payload.mapper"
import { Otp } from "../../domain/entities/otp.entity"
import { IOtpRepository } from "../../domain/repositories/otp.repository"

import {
  IHashService,
  ILoginUseCase,
  ITokenService,
  IMailService,
  IOtpService,
} from "../interfaces"
import { AuthOutput, LoginInput } from "../dto"

export class LoginUseCase implements ILoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenService: ITokenService,
    private readonly hashService: IHashService,
    private readonly otpRepository: IOtpRepository,
    private readonly otpService: IOtpService,
    private readonly mailService: IMailService
  ) {}

  async execute(data: LoginInput): Promise<AuthOutput> {
    const user = await this.userRepository.findByEmail(data.email)

    const DUMMY_HASH = "$argon2id$v=19$m=65536,t=3,p=4$dummy$dummy"

    if (!user || (user.authProvider !== AUTH_PROVIDER.LOCAL && !user.password)) {
      await this.hashService.verify(DUMMY_HASH, data.password).catch(() => {})
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.BAD_REQUEST)
    }

    if (!user.password) {
      await this.hashService.verify(DUMMY_HASH, data.password).catch(() => {})
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.BAD_REQUEST)
    }

    const isPasswordValid = await this.hashService.verify(user.password, data.password)

    if (!isPasswordValid) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.BAD_REQUEST)
    }

    if (user.isBlocked) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_BLOCKED, HTTP_STATUS.FORBIDDEN)
    }

    if (!user.isVerified) {
      const code = await this.otpService.generateOtp(user.email)

      const otp = new Otp({ email: user.email, code })
      await this.otpRepository.save(otp)

      await this.mailService.sendVerificationEmail(user.email, code)

      throw new AppError(ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED, HTTP_STATUS.UNAUTHORIZED)
    }

    const tokenPayload = TokenPayloadMapper.toTokenPayload(user)

    const accessToken = this.tokenService.generateAccessToken(tokenPayload)
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload)

    const hashedRefreshToken = await this.hashService.hash(refreshToken)
    await this.refreshTokenRepository.save(user.id!, new RefreshToken(hashedRefreshToken))

    return {
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        walletBalance: user.walletBalance,
        isVerified: user.isVerified,
        authProvider: user.authProvider,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    }
  }
}
