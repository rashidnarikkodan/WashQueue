import { AppError } from "@/common/errors/app-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IOtpRepository } from "../../domain/repositories/otp.repository"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { IHashService, IResetPasswordUseCase } from "../interfaces"
import { ResetPasswordInput } from "../dto"

export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpRepository: IOtpRepository,
    private readonly hashService: IHashService
  ) {}

  async execute(data: ResetPasswordInput): Promise<void> {
    const otp = await this.otpRepository.findByEmail(data.email)
    if (!otp || !otp.verify(data.code)) {
      throw new AppError(ERROR_MESSAGES.INVALID_OR_EXPIRED_CODE, HTTP_STATUS.BAD_REQUEST)
    }

    await this.otpRepository.delete(data.email)

    const user = await this.userRepository.findByEmail(data.email)
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }

    const hashedPassword = await this.hashService.hash(data.password)

    await this.userRepository.resetPassword(user.id!, hashedPassword)
  }
}
