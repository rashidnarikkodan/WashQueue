import { OAuth2Client } from "google-auth-library"
import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "../../domain/repositories/user.repository"
import { TokenService } from "../services/token.service"
import env from "@/configs/env.config"
import logger from "@/configs/logger.config"

import { User } from "../../domain/entities/User"

export class GoogleAuthUseCase {
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

  async execute(token: string) {
    if (!token) {
      throw new AppError("Google token is required", 400)
    }

    let email: string
    let name: string
    let picture: string | undefined

    const isJwt = token.split(".").length === 3

    if (isJwt) {
      if (!this.client || !env.GOOGLE_CLIENT_ID) {
        throw new AppError("Google authentication client is not configured on the server", 500)
      }
      // 1. Verify Google ID token (JWT)
      try {
        const ticket = await this.client.verifyIdToken({
          idToken: token,
          audience: env.GOOGLE_CLIENT_ID,
        })
        const payload = ticket.getPayload()
        if (!payload || !payload.email) {
          throw new AppError("Invalid Google token payload", 400)
        }
        email = payload.email
        name = payload.name || "Google User"
        picture = payload.picture
      } catch (error: any) {
        throw new AppError(error.message || "Google authentication failed", 401)
      }
    } else {
      // 2. Treat as Google Access Token and fetch user profile via UserInfo API
      try {
        const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) {
          throw new AppError("Failed to fetch user profile from Google", 401)
        }
        const payload = await response.json() as any
        if (!payload || !payload.email) {
          throw new AppError("Invalid Google access token payload", 400)
        }
        email = payload.email
        name = payload.name || "Google User"
        picture = payload.picture
      } catch (error: any) {
        if (error instanceof AppError) throw error
        throw new AppError("Google authentication failed", 401)
      }
    }

    let user = await this.userRepository.findByEmail(email)
    if (!user) {
      const newUser = new User({
        name,
        email: email.toLowerCase(),
        avatar: picture || "",
        authProvider: "GOOGLE",
        role: "CUSTOMER",
        isVerified: true,
      })
      user = await this.userRepository.create(newUser)
    }

    if (user.isBlocked) {
      throw new AppError("Account is blocked", 403)
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
