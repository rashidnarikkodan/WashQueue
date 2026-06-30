import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { ROLE, RoleType } from "@/shared/constants/role.constants"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { ERROR_MESSAGES } from "@/shared/constants/error.constants"

import { ISetupAccountUseCase } from "../interfaces/auth-usecases.interfaces"
import { SetupAccountResponse } from "../dto/setup-account.dto"

export class SetupAccountUseCase implements ISetupAccountUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, role: RoleType): Promise<SetupAccountResponse> {

    if (role !== ROLE.CUSTOMER && role !== ROLE.PROVIDER) {
      throw new AppError(ERROR_MESSAGES.INVALID_ROLE, HTTP_STATUS.BAD_REQUEST)
    }

    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }

    const updatedUser = await this.userRepository.update(userId, {
      role,
    })

    if (!updatedUser) {
      throw new AppError(ERROR_MESSAGES.ROLE_UPDATE_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    return {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role, // Return client-compatible role representation
        isVerified: updatedUser.isVerified,
      },
    }
  }
}
