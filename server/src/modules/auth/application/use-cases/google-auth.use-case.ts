import { OAuth2Client } from "google-auth-library"
import { AppError } from "@/common/errors/app-error"
import env from "@/configs/env.config"
import logger from "@/configs/logger.config"
import { TokenPayloadMapper } from "../mappers/token-payload.mapper"

import { User } from "@/modules/user/domain/entities/User"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IRefreshTokenRepository } from "../../domain/repositories/refresh-token.repository"
import { RefreshToken } from "../../domain/entities/refresh-token.entity"

import { IGoogleAuthUseCase, IHashService, ITokenService } from "../interfaces"
import { AuthOutput } from "../dto"

import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { ROLE } from "@/common/constants/role.constants"
import { AUTH_PROVIDER } from "@/common/constants/authProvider"

export class GoogleAuthUseCase implements IGoogleAuthUseCase {
  private client: OAuth2Client | null = null

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenService: ITokenService,
    private readonly hashService: IHashService
  ) {
    if (env.GOOGLE_CLIENT_ID) {
      this.client = new OAuth2Client(env.GOOGLE_CLIENT_ID)
    } else {
      logger.warn(
        "GOOGLE_CLIENT_ID not provided. GoogleAuthUseCase running in development/fallback mode."
      )
    }
  }

  async execute(token: string): Promise<AuthOutput> {
    if (!token) {
      throw new AppError(ERROR_MESSAGES.GOOGLE_TOKEN_REQUIRED, HTTP_STATUS.BAD_REQUEST)
    }

    let email: string
    let name: string
    let picture: string | undefined

    const isJwt = token.split(".").length === 3

    if (isJwt) {
      if (!this.client || !env.GOOGLE_CLIENT_ID) {
        throw new AppError(ERROR_MESSAGES.GOOGLE_CONFIG_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }
      // Verify Google ID token (JWT)
      try {
        const ticket = await this.client.verifyIdToken({
          idToken: token,
          audience: env.GOOGLE_CLIENT_ID,
        })
        const payload = ticket.getPayload()
        if (!payload || !payload.email) {
          throw new AppError(ERROR_MESSAGES.INVALID_GOOGLE_TOKEN_PAYLOAD, HTTP_STATUS.BAD_REQUEST)
        }
        email = payload.email
        name = payload.name || "Google User"
        picture = payload.picture
      } catch (error: unknown) {
        throw new AppError(
          error instanceof Error ? error.message : ERROR_MESSAGES.GOOGLE_AUTH_FAILED,
          HTTP_STATUS.UNAUTHORIZED
        )
      }
    } else {
      // Treat as Google Access Token and fetch user profile via UserInfo API
      try {
        const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) {
          throw new AppError(ERROR_MESSAGES.GOOGLE_PROFILE_FETCH_FAILED, HTTP_STATUS.UNAUTHORIZED)
        }
        const payload = (await response.json()) as {
          email: string
          name?: string
          picture?: string
        }
        if (!payload || !payload.email) {
          throw new AppError(ERROR_MESSAGES.INVALID_GOOGLE_ACCESS_TOKEN, HTTP_STATUS.BAD_REQUEST)
        }
        email = payload.email
        name = payload.name || "Google User"
        picture = payload.picture
      } catch (error: unknown) {
        if (error instanceof AppError) throw error
        throw new AppError(ERROR_MESSAGES.GOOGLE_AUTH_FAILED, HTTP_STATUS.UNAUTHORIZED)
      }
    }

    let user = await this.userRepository.findByEmail(email)
    let isNewUser = false
    if (!user) {
      const newUser = new User({
        name,
        email: email.toLowerCase(),
        avatar: picture || "",
        authProvider: AUTH_PROVIDER.GOOGLE,
        role: ROLE.CUSTOMER,
        isVerified: true,
      })
      user = await this.userRepository.save(newUser)
      isNewUser = true
    }

    if (user.isBlocked) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_BLOCKED, HTTP_STATUS.FORBIDDEN)
    }

    // Map payload using mapper
    const tokenPayload = TokenPayloadMapper.toTokenPayload(user)

    const accessToken = this.tokenService.generateAccessToken(tokenPayload)
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload)

    // Secure the refresh token by hashing it
    const hashedRefreshToken = await this.hashService.hash(refreshToken)

    // Save refresh token and update last login timestamp
    await this.refreshTokenRepository.save(user.id!, new RefreshToken(hashedRefreshToken))
    await this.userRepository.update(user.id!, { lastLoginAt: new Date() })

    logger.info(`Google auth: User=${user.email}, isNewUser=${isNewUser}`)

    return {
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isNewUser,
        authProvider: user.authProvider,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    }
  }
}
