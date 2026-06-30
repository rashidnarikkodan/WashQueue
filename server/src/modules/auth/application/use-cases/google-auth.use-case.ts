import { OAuth2Client } from "google-auth-library"
import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { TokenService } from "../../infrastructure/services/token.service"
import env from "@/configs/env.config"
import logger from "@/configs/logger.config"
import { User } from "@/modules/user/domain/entities/User"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { ERROR_MESSAGES } from "@/shared/constants/error.constants"
import { ROLE } from "@/shared/constants/role.constants"
import { AUTH_PROVIDER } from "@/shared/constants/authProvider"

import { IGoogleAuthUseCase } from "../interfaces/auth-usecases.interfaces"
import { GoogleAuthResponse } from "../dto/google-auth.dto"

export class GoogleAuthUseCase implements IGoogleAuthUseCase {
  private client: OAuth2Client | null = null

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService
  ) {
    if (env.GOOGLE_CLIENT_ID) {
      this.client = new OAuth2Client(env.GOOGLE_CLIENT_ID)
    } else {
      logger.warn("GOOGLE_CLIENT_ID not provided. GoogleAuthUseCase running in development/fallback mode.")
    }
  }

  async execute(token: string): Promise<GoogleAuthResponse> {
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
      // 1. Verify Google ID token (JWT)
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
      // 2. Treat as Google Access Token and fetch user profile via UserInfo API
      try {
        const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) {
          throw new AppError(ERROR_MESSAGES.GOOGLE_PROFILE_FETCH_FAILED, HTTP_STATUS.UNAUTHORIZED)
        }
        const payload = await response.json() as { email: string; name?: string; picture?: string }
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
      user = await this.userRepository.create(newUser)
      isNewUser = true
    }

    if (user.isBlocked) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_BLOCKED, HTTP_STATUS.FORBIDDEN)
    }

    const tokenPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
    }

    const accessToken = this.tokenService.generateAccessToken(tokenPayload)
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload)

    await this.userRepository.update(user.id, {
      refreshToken,
      lastLoginAt: new Date(),
    })

    logger.info(`Google auth: User=${user.email}, isNewUser=${isNewUser}`)

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isNewUser,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    }
  }
}
