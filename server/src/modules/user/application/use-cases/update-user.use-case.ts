import { IUserRepository } from "../../domain/repositories/user.repository"
import { User } from "../../domain/entities/User"
import { UpdateUserInput } from "../dto/update-user.dto"
import { IUpdateUserUseCase } from "../interfaces/user-usecases.interfaces"
import { ICacheService } from "@/core/application/cache.interface"

const BLOCKED_USER_TTL_SECONDS = 30 * 24 * 60 * 60 // 30 days

export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly cacheService: ICacheService,
  ) { }

  async execute(id: string, updates: UpdateUserInput): Promise<User | null> {
    const updatedUser = await this.userRepository.update(id, updates)

    if (updatedUser && typeof updates.isBlocked === "boolean") {
      const key = `blocked:${id}`
      if (updates.isBlocked) {
        // Blacklist user session. Set TTL to 30 days.
        await this.cacheService.set(key, "true", BLOCKED_USER_TTL_SECONDS)
      } else {
        await this.cacheService.del(key)
      }
    }

    return updatedUser
  }
}
