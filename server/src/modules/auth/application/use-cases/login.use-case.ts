import argon2 from "argon2"
import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { TokenService } from "../../infrastructure/services/token.service"
import { LoginInput } from "../schema/login.schema"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { ERROR_MESSAGES } from "@/shared/constants/error.constants"
import { ILoginUseCase } from "../interfaces/auth-usecases.interfaces"

export interface LoginResponse {
  user: {
    id: string
    name?: string
    email: string
    role: string
    isVerified: boolean
  }
  tokens: {
    accessToken: string
    refreshToken: string
  }
}

export class LoginUseCase implements ILoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService
  ) { }

  async execute(data: LoginInput): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(data.email)
    if (!user) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.BAD_REQUEST)
    }

    if (!user.password) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.BAD_REQUEST)
    }

    const isPasswordValid = await argon2.verify(user.password, data.password)
    if (!isPasswordValid) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.BAD_REQUEST)
    }

    if (user.isBlocked) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_BLOCKED, HTTP_STATUS.FORBIDDEN)
    }

    if (!user.isVerified) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED, HTTP_STATUS.UNAUTHORIZED)
    }

    // Generate JWT access & refresh tokens
    const tokenPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
    }

    const accessToken = this.tokenService.generateAccessToken(tokenPayload)
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload)

    // Save refresh token and update last login timestamp
    await this.userRepository.update(user.id, {
      refreshToken,
      lastLoginAt: new Date(),
    })

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