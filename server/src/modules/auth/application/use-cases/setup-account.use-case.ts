import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { ROLE, RoleType } from "@/shared/constants/role.constants"

export class SetupAccountUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, role: RoleType) {

    if (role !== ROLE.CUSTOMER && role !== ROLE.PROVIDER) {
      throw new AppError("Invalid role specified", 400)
    }

    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new AppError("User not found", 404)
    }

    const updatedUser = await this.userRepository.update(userId, {
      role,
    })

    if (!updatedUser) {
      throw new AppError("Failed to update account role", 500)
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
