import { AppError } from "@/shared/errors/app-error"
import { IUserRepository } from "../../domain/repositories/user.repository"

export class SetupAccountUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, role: string) {
    let mappedRole = role.toUpperCase()
    if (mappedRole === "USER") {
      mappedRole = "CUSTOMER"
    }

    if (mappedRole !== "CUSTOMER" && mappedRole !== "PROVIDER") {
      throw new AppError("Invalid role specified", 400)
    }

    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new AppError("User not found", 404)
    }

    const updatedUser = await this.userRepository.update(userId, {
      role: mappedRole as any,
    })

    if (!updatedUser) {
      throw new AppError("Failed to update account role", 500)
    }

    return {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: role.toLowerCase(), // Return client-compatible role representation
        isVerified: updatedUser.isVerified,
      },
    }
  }
}
