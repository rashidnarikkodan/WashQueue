import argon2 from "argon2"
import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { SignupInput } from "@/modules/auth/application/schema/signup.schema"
import { OtpService } from "../../infrastructure/services/otp.service"
import { MailService } from "@/infrastructure/mail/mail.service"
import { User } from "@/modules/user/infrastructure/models/user.model"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { ROLE } from "@/shared/constants/role.constants"
import { AUTH_PROVIDER } from "@/shared/constants/authProvider"

import { ISignupUseCase } from "../interfaces/auth-usecases.interfaces"

export class SignupUseCase implements ISignupUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpService: OtpService,
    private readonly mailService: MailService
  ) { }

  async execute(data: SignupInput) {

    //check user existing or not
    const existingUser = await this.userRepository.findByEmail(data.email)
    if (existingUser) {
      throw new AppError("User already exists", HTTP_STATUS.CONFLICT)
    }

    // Hash password with Argon2
    const hashedPassword = await argon2.hash(data.password)

    // Save the user in database using Domain Entity
    const newUser = new User({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: ROLE.CUSTOMER, // default signuping role
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