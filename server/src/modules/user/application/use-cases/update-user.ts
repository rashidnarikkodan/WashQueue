import { IUserRepository } from "../../domain/repositories/user.repository";
import redis from "@/infrastructure/redis/redis.client";

export class UpdateUser {
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string, updates: { isBlocked?: boolean; name?: string; email?: string; phone?: string }) {
    const updatedUser = await this.userRepository.update(id, updates);
    
    if (updatedUser && typeof updates.isBlocked === "boolean") {
      const key = `blocked:${id}`;
      if (updates.isBlocked) {
        // Blacklist user session. Set TTL to 30 days.
        await redis.set(key, "true", "EX", 30 * 24 * 60 * 60);
      } else {
        await redis.del(key);
      }
    }
    
    return updatedUser;
  }
}
