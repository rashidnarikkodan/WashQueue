import argon2 from "argon2"
import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "../../domain/repositories/user.repository"
import { TokenService } from "../services/token.service"
import { LoginInput } from "../schema/login.schema"

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService
  ) {}

  async execute(data: LoginInput): Promise<any> {
    const user = await this.userRepository.findByEmail(data.email)
    if (!user) {
      throw new AppError("Invalid credentials", 400)
    }

    if (!user.password) {
      throw new AppError("Invalid credentials", 400)
    }

    const isPasswordValid = await argon2.verify(user.password, data.password)
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 400)
    }

    if (user.isBlocked) {
      throw new AppError("Account is blocked", 403)
    }

    if (!user.isVerified) {
      throw new AppError("Account is not verified", 401)
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