import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { ForgotPasswordInput } from "../dto/forgot-password.dto"
import { IOtpService } from "../interfaces/otp-service.interface"
import { IMailService } from "../interfaces/mail-service.interface"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { AUTH_PROVIDER } from "@/shared/constants/authProvider"
import { IForgotPasswordUseCase } from "../interfaces/auth-usecases.interfaces"

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
