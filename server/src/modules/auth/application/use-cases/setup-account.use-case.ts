import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { ROLE, RoleType } from "@/shared/constants/role.constants"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { ERROR_MESSAGES } from "@/shared/constants/error.constants"
import { AuthUser } from "../dto"
import { ISetupAccountUseCase } from "../interfaces"

export class SetupAccountUseCase implements ISetupAccountUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, role: RoleType): Promise<AuthUser> {
    if (role !== ROLE.CUSTOMER && role !== ROLE.PROVIDER) {
      throw new AppError(ERROR_MESSAGES.INVALID_ROLE, HTTP_STATUS.BAD_REQUEST)
    }

    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }

    // Call descriptive updateRole method
    await this.userRepository.updateRole(userId, role)

    // Fetch the updated user since we need to return it
    const updatedUser = await this.userRepository.findById(userId)
    if (!updatedUser) {
      throw new AppError(ERROR_MESSAGES.ROLE_UPDATE_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    return  {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
    }
  }
}
