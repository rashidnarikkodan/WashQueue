import { AppError } from "@/common/errors/app-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IOtpRepository } from "../../domain/repositories/otp.repository"
import { Otp } from "../../domain/entities/otp.entity"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { AUTH_PROVIDER } from "@/common/constants/authProvider"
import { IHashService, IOtpService, IResetPasswordUseCase } from "../interfaces"
import { ResetPasswordInput } from "../dto"

export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpRepository: IOtpRepository,
    private readonly otpService: IOtpService,
    private readonly hashService: IHashService
  ) { }

  async execute(data: ResetPasswordInput): Promise<void> {
    // Verify OTP code using the repository and entity
    const otp = await this.otpRepository.findByEmail(data.email)
    if (!otp || !otp.verify(data.code)) {
      throw new AppError(ERROR_MESSAGES.INVALID_OR_EXPIRED_CODE, HTTP_STATUS.BAD_REQUEST)
    }

    // Delete OTP after successful verification
    await this.otpRepository.delete(data.email)

    const user = await this.userRepository.findByEmail(data.email)
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }

    // Security Check: Google OAuth users do not use passwords and should not reset passwords
    if (user.authProvider !== AUTH_PROVIDER.LOCAL) {
      throw new AppError(ERROR_MESSAGES.SOCIAL_ACCOUNT_PASSWORD_RESET, HTTP_STATUS.BAD_REQUEST)
    }

    // Hash the new password using the abstracted hash service
    const hashedPassword = await this.hashService.hash(data.password)

    // Update the password in database using descriptive method
    await this.userRepository.resetPassword(user.id!, hashedPassword)
  }
}
