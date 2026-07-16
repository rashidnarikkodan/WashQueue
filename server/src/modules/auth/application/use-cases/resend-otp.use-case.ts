import { AppError } from "@/common/errors/app-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IOtpRepository } from "../../domain/repositories/otp.repository"
import { Otp } from "../../domain/entities/otp.entity"
import { IResendOtpUseCase, IMailService, IOtpService } from "../interfaces"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"

export class ResendOtpUseCase implements IResendOtpUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpRepository: IOtpRepository,
    private readonly otpService: IOtpService,
    private readonly mailService: IMailService
  ) {}

  async execute(data: { email: string }): Promise<void> {
    const user = await this.userRepository.findByEmail(data.email)

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }

    // Generate numeric OTP
    const code = await this.otpService.generateOtp(user.email)

    // Save OTP to repository using domain entity
    const otp = new Otp({ email: user.email, code })
    await this.otpRepository.save(otp)

    // Send email with OTP code
    await this.mailService.sendVerificationEmail(user.email, code)
  }
}
