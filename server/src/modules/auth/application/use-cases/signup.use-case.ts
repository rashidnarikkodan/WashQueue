import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ROLE } from "@/common/constants/role.constants"
import { AUTH_PROVIDER } from "@/common/constants/authProvider"

import { User } from "@/modules/user/domain/entities/User"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IOtpRepository } from "../../domain/repositories/otp.repository"
import { Otp } from "../../domain/entities/otp.entity"

import { SignupInput } from "../dto"
import { IHashService, IMailService, IOtpService, ISignupUseCase } from "../interfaces"

export class SignupUseCase implements ISignupUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpRepository: IOtpRepository,
    private readonly otpService: IOtpService,
    private readonly mailService: IMailService,
    private readonly hashService: IHashService
  ) {}

  async execute(data: SignupInput): Promise<null> {
    const existingUser = await this.userRepository.findByEmail(data.email)
    if (existingUser) {
      throw new AppError("User already exists", HTTP_STATUS.CONFLICT)
    }

    const hashedPassword = await this.hashService.hash(data.password)

    const newUser = new User({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: ROLE.CUSTOMER,
      isVerified: false,
      authProvider: AUTH_PROVIDER.LOCAL,
    })

    const user = await this.userRepository.save(newUser)

    const code = await this.otpService.generateOtp(user.email)

    const otp = new Otp({ email: user.email, code })
    await this.otpRepository.save(otp)

    await this.mailService.sendVerificationEmail(user.email, code)

    return null
  }
}
