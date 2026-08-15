import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IOtpRepository } from "../../domain/repositories/otp.repository"
import { Otp } from "../../domain/entities/otp.entity"
import { ForgotPasswordInput } from "../dto"
import { IForgotPasswordUseCase, IMailService, IOtpService } from "../interfaces"

export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpRepository: IOtpRepository,
    private readonly otpService: IOtpService,
    private readonly mailService: IMailService
  ) {}

  async execute(data: ForgotPasswordInput): Promise<void> {
    const user = await this.userRepository.findByEmail(data.email)

    // Respond the same way whether or not the account exists, so this endpoint can't be used
    // to enumerate registered emails — only actually send anything if a user was found.
    if (!user) {
      return
    }

    // Generate numeric OTP
    const code = await this.otpService.generateOtp(user.email)

    // Save OTP to repository using domain entity
    const otp = new Otp({ email: user.email, code })
    await this.otpRepository.save(otp)

    // Send password reset email
    await this.mailService.sendForgotPasswordEmail(user.email, code)
  }
}
