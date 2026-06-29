import argon2 from "argon2"
import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { ResetPasswordInput } from "../schema/reset-password.schema"
import { OtpService } from "../services/otp.service"
import { HTTP_STATUS } from "@/shared/constants/http.constants"

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpService: OtpService
  ) {}

  async execute(data: ResetPasswordInput): Promise<void> {
    // Verify OTP code
    const isOtpValid = await this.otpService.verifyOtp(data.email, data.code)
    if (!isOtpValid) {
      throw new AppError("Invalid or expired verification code", HTTP_STATUS.BAD_REQUEST)
    }

    const user = await this.userRepository.findByEmail(data.email)
    if (!user) {
      throw new AppError("User not found", HTTP_STATUS.NOT_FOUND)
    }

    // Hash the new password with Argon2
    const hashedPassword = await argon2.hash(data.password)

    // Update the password in database
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      isVerified: true // If they reset password via email OTP, their email is verified
    })
  }
}
