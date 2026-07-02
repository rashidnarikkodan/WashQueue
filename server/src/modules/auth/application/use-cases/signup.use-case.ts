import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { SignupInput, SignupResponse } from "../dto/signup.dto"
import { IOtpService } from "../interfaces/otp-service.interface"
import { IMailService } from "../interfaces/mail-service.interface"
import { IHashService } from "../interfaces/hash-service.interface"
import { User } from "@/modules/user/domain/entities/User"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { ROLE } from "@/shared/constants/role.constants"
import { AUTH_PROVIDER } from "@/shared/constants/authProvider"
import { ISignupUseCase } from "../interfaces/auth-usecases.interfaces"

export class SignupUseCase implements ISignupUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpService: IOtpService,
    private readonly mailService: IMailService,
    private readonly hashService: IHashService
  ) { }

  async execute(data: SignupInput): Promise<SignupResponse> {
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

    const user = await this.userRepository.create(newUser)

    // Generate numeric OTP
    const otp = await this.otpService.generateOtp(user.email)

    // Send email with OTP code
    await this.mailService.sendVerificationEmail(user.email, otp)

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    }
  }
}