import argon2 from "argon2"
import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "@/modules/auth/domain/repositories/user.repository"
import { RegisterInput } from "@/modules/auth/application/schema/register.schema"
import { OtpService } from "../services/otp.service"
import { MailService } from "@/infrastructure/mail/mail.service"

export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpService: OtpService,
    private readonly mailService: MailService
  ) {}

  async execute(data: RegisterInput) {
    const existingUser = await this.userRepository.findByEmail(data.email)
    if (existingUser) {
      throw new AppError("User already exists", 400)
    }

    // Hash password with Argon2
    const hashedPassword = await argon2.hash(data.password)

    // Save the user in database
    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: "CUSTOMER", // default registering role
      isVerified: false,
      authProvider: "LOCAL",
    })

    // Generate numeric OTP
    const otp = await this.otpService.generateOtp(user.email)

    // Send email with OTP code
    await this.mailService.sendVerificationEmail(user.email, otp)

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    }
  }
}