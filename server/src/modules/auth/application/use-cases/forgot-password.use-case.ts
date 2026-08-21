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

    if (!user) {
      return
    }

    const code = await this.otpService.generateOtp(user.email)

    const otp = new Otp({ email: user.email, code })
    await this.otpRepository.save(otp)

    await this.mailService.sendForgotPasswordEmail(user.email, code)
  }
}
