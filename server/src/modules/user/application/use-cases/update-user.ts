import { IUserRepository } from "../../domain/repositories/user.repository"
import { User } from "../../domain/entities/User"
import { UpdateUserInput } from "../dto/update-user.dto"
import { IUpdateUserUseCase } from "../interfaces/user-usecases.interfaces"
import redis from "@/infrastructure/cache/redis.client"

export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
  ) { }

  async execute(id: string, updates: UpdateUserInput): Promise<User | null> {
    const updatedUser = await this.userRepository.update(id, updates)

    if (updatedUser && typeof updates.isBlocked === "boolean") {
      const key = `blocked:${id}`
      if (updates.isBlocked) {
        // Blacklist user session. Set TTL to 30 days.
        await redis.set(key, "true", "EX", 30 * 24 * 60 * 60)
      } else {
        await redis.del(key)
      }
    }

    return updatedUser
  }
}
