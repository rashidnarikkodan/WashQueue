import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { ForgotPasswordInput } from "../dto"
import { IForgotPasswordUseCase, IMailService, IOtpService } from "../interfaces"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { ERROR_MESSAGES } from "@/shared/constants/error.constants"
import { AUTH_PROVIDER } from "@/shared/constants/authProvider"

export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpService: IOtpService,
    private readonly mailService: IMailService
  ) { }

  async execute(data: ForgotPasswordInput): Promise<void> {
    const user = await this.userRepository.findByEmail(data.email)
    
    // Trade-off: Throwing NOT_FOUND error reveals account existence to an attacker (User Enumeration).
    // However, it is kept here to provide a clear, UX-friendly message to users so they know they entered the wrong email.
    if (!user) {
      throw new AppError(ERROR_MESSAGES.NO_ACCOUNT_WITH_EMAIL, HTTP_STATUS.NOT_FOUND)
    }

    if (user.authProvider === AUTH_PROVIDER.GOOGLE) {
      throw new AppError(
        ERROR_MESSAGES.GOOGLE_ACCOUNT_PASSWORD_RESET,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    // Generate numeric OTP
    const otp = await this.otpService.generateOtp(user.email)

    // Send password reset email
    await this.mailService.sendForgotPasswordEmail(user.email, otp)
  }
}
