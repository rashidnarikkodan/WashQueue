import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { AUTH_PROVIDER } from "@/common/constants/authProvider"

import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IRefreshTokenRepository } from "../../domain/repositories/refresh-token.repository"
import { RefreshToken } from "../../domain/entities/refresh-token.entity"
import { TokenPayloadMapper } from "../mappers/token-payload.mapper"

import { IHashService, ILoginUseCase, ITokenService } from "../interfaces"
import { AuthOutput, LoginInput } from "../dto"


export class LoginUseCase implements ILoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenService: ITokenService,
    private readonly hashService: IHashService
  ) { }

  async execute(data: LoginInput): Promise<AuthOutput> {
    const user = await this.userRepository.findByEmail(data.email)
    
    // Dummy hash check to prevent user enumeration
    const DUMMY_HASH = "$argon2id$v=19$m=65536,t=3,p=4$dummy$dummy"

    // If no user, or it's a social account that shouldn't use local password login
    if (!user || user.authProvider !== AUTH_PROVIDER.LOCAL) {
      await this.hashService.verify(DUMMY_HASH, data.password).catch(() => {})
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.BAD_REQUEST)
    }

    if (user.isBlocked) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_BLOCKED, HTTP_STATUS.FORBIDDEN)
    }

    if (!user.isVerified) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED, HTTP_STATUS.UNAUTHORIZED)
    }

    if (!user.password) {
      await this.hashService.verify(DUMMY_HASH, data.password).catch(() => {})
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.BAD_REQUEST)
    }

    const isPasswordValid = await this.hashService.verify(user.password, data.password)
    
    if (!isPasswordValid) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.BAD_REQUEST)
    }

    // Generate JWT access & refresh tokens
    const tokenPayload = TokenPayloadMapper.toTokenPayload(user)

    const accessToken = this.tokenService.generateAccessToken(tokenPayload)
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload)

    // Hash refresh token for secure persistence
    const hashedRefreshToken = await this.hashService.hash(refreshToken)

    // Save refresh token and update last login timestamp
    await this.refreshTokenRepository.save(user.id!, new RefreshToken(hashedRefreshToken))
    await this.userRepository.update(user.id!, { lastLoginAt: new Date() })

    return {
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    }
  }
}