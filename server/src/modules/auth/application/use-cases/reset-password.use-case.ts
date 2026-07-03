import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { AUTH_PROVIDER } from "@/shared/constants/authProvider"
import { IHashService, IOtpService, IResetPasswordUseCase } from "../interfaces"
import { ResetPasswordInput } from "../dto"

export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpService: IOtpService,
    private readonly hashService: IHashService
  ) { }

  async execute(data: ResetPasswordInput): Promise<void> {
    // Verify OTP code using the abstraction
    const isOtpValid = await this.otpService.verifyOtp(data.email, data.code)
    if (!isOtpValid) {
      throw new AppError("Invalid or expired verification code", HTTP_STATUS.BAD_REQUEST)
    }

    const user = await this.userRepository.findByEmail(data.email)
    if (!user) {
      throw new AppError("User not found", HTTP_STATUS.NOT_FOUND)
    }

    // Security Check: Google OAuth users do not use passwords and should not reset passwords
    if (user.authProvider !== AUTH_PROVIDER.LOCAL) {
      throw new AppError("Social login accounts cannot reset passwords", HTTP_STATUS.BAD_REQUEST)
    }

    // Hash the new password using the abstracted hash service
    const hashedPassword = await this.hashService.hash(data.password)

    // Update the password in database using descriptive method
    await this.userRepository.resetPassword(user.id, hashedPassword)
  }
}
