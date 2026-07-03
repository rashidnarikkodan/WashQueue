import { AppError } from "@/shared/errors/app-error"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { ERROR_MESSAGES } from "@/shared/constants/error.constants"
import { AUTH_PROVIDER } from "@/shared/constants/authProvider"

import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { TokenPayloadMapper } from "../mappers/token-payload.mapper"

import { IHashService, ILoginUseCase, ITokenService } from "../interfaces"
import { AuthOutput, LoginInput } from "../dto"


export class LoginUseCase implements ILoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly hashService: IHashService
  ) { }

  async execute(data: LoginInput): Promise<AuthOutput> {
    const user = await this.userRepository.findByEmail(data.email)
    
    // Dummy hash check to prevent user enumeration
    const DUMMY_HASH = "$argon2id$v=19$m=65536,t=3,p=4$dummy$dummy"

    // If no user, or it's a social account that shouldn't use local password login
    if (!user || user.authProvider !== AUTH_PROVIDER.LOCAL) {
      // Execute dummy verify to prevent timing attacks
      await this.hashService.verify(DUMMY_HASH, data.password).catch(() => {})
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.BAD_REQUEST)
    }

    if (user.isBlocked) {
      // Don't run password check here to save CPU (preventing DoS)
      // Though it might reveal blocked status, it's accepted for mitigating CPU DoS
      throw new AppError(ERROR_MESSAGES.ACCOUNT_BLOCKED, HTTP_STATUS.FORBIDDEN)
    }

    if (!user.isVerified) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED, HTTP_STATUS.UNAUTHORIZED)
    }

    if (!user.password) {
      // Unlikely since we check AUTH_PROVIDER.LOCAL, but a safety check
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

    // Save refresh token and update last login timestamp atomically
    await this.userRepository.recordLoginSuccess(user.id, hashedRefreshToken, new Date())

    return {
      user: {
        id: user.id,
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