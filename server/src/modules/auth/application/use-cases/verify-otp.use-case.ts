import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "../../domain/repositories/user.repository"
import { OtpService } from "../services/otp.service"
import { TokenService } from "../services/token.service"
import { VerifyOtpInput } from "../schema/verify-otp.schema"

export class VerifyOtpUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpService: OtpService,
    private readonly tokenService: TokenService
  ) {}

  async execute(data: VerifyOtpInput) {
    const isOtpValid = await this.otpService.verifyOtp(data.email, data.otp)
    if (!isOtpValid) {
      throw new AppError("Invalid or expired OTP", 400)
    }

    const user = await this.userRepository.findByEmail(data.email)
    if (!user) {
      throw new AppError("User not found", 404)
    }

    // Generate JWT tokens
    const tokenPayload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    }

    const accessToken = this.tokenService.generateAccessToken(tokenPayload)
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload)

    // Save refresh token to user document and set isVerified to true
    await this.userRepository.update(user._id.toString(), {
      isVerified: true,
      refreshToken,
    })

    return {
      user: {
        id: user._id,
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
