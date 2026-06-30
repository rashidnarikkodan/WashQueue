import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { ForgotPasswordInput } from "../schema/forgot-password.schema"
import { OtpService } from "../../infrastructure/services/otp.service"
import { MailService } from "@/infrastructure/mail/mail.service"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { AUTH_PROVIDER } from "@/shared/constants/authProvider"

import { IForgotPasswordUseCase } from "../interfaces/auth-usecases.interfaces"

export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpService: OtpService,
    private readonly mailService: MailService
  ) { }

  async execute(data: ForgotPasswordInput): Promise<void> {
    const user = await this.userRepository.findByEmail(data.email)
    if (!user) {
      throw new AppError("No account found with this email address", HTTP_STATUS.NOT_FOUND)
    }

    if (user.authProvider === AUTH_PROVIDER.GOOGLE) {
      throw new AppError(
        "This account is registered via Google. Please log in using Google.",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    // Generate numeric OTP
    const otp = await this.otpService.generateOtp(user.email)

    // Send password reset email
    await this.mailService.sendForgotPasswordEmail(user.email, otp)
  }
}
