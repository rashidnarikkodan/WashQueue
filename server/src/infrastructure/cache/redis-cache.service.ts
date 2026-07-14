import redis from "./redis.client"
import { ICacheService } from "@/core/application/cache.interface"

export class RedisCacheService implements ICacheService {
  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await redis.set(key, value, "EX", ttlSeconds)
  }

  async get(key: string): Promise<string | null> {
    return redis.get(key)
  }

  async del(key: string): Promise<void> {
    await redis.del(key)
  }
}
