import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ROLE } from "@/common/constants/role.constants"
import { AUTH_PROVIDER } from "@/common/constants/authProvider"

import { User } from "@/modules/user/domain/entities/User"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"

import { SignupInput } from "../dto"
import { IHashService, IMailService, IOtpService, ISignupUseCase } from "../interfaces"


export class SignupUseCase implements ISignupUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpService: IOtpService,
    private readonly mailService: IMailService,
    private readonly hashService: IHashService
  ) { }

  async execute(data: SignupInput): Promise<null> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email)
    if (existingUser) {
      throw new AppError("User already exists", HTTP_STATUS.CONFLICT)
    }

    // Hash password using abstracted IHashService
    const hashedPassword = await this.hashService.hash(data.password)

    // Save the user in database using Domain Entity
    const newUser = new User({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: ROLE.CUSTOMER, // default signing-up role
      isVerified: false,
      authProvider: AUTH_PROVIDER.LOCAL,
    })

    const user = await this.userRepository.save(newUser)

    // Generate numeric OTP
    const otp = await this.otpService.generateOtp(user.email)

    // Send email with OTP code
    await this.mailService.sendVerificationEmail(user.email, otp)

    return null
  }
}