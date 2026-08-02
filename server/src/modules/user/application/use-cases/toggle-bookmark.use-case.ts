import { User } from "../../domain/entities/User"
import { IUserRepository } from "../../domain/repositories/user.repository"
import { IToggleBookmarkUseCase } from "../interfaces/user-usecases.interfaces"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"

export class ToggleBookmarkUseCase implements IToggleBookmarkUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, stationId: string): Promise<User | null> {
    const updatedUser = await this.userRepository.toggleBookmark(userId, stationId)
    if (!updatedUser) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND)
    }
    return updatedUser
  }
}
