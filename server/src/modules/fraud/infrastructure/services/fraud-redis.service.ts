import redis from "@/infrastructure/cache/redis.client"
import { IFraudCacheService } from "../../domain/services/fraud-cache.interface"

export class FraudRedisService implements IFraudCacheService {
  async incrementWithTtl(key: string, ttlSeconds: number): Promise<number> {
    const multi = redis.multi()
    multi.incr(key)
    multi.expire(key, ttlSeconds)
    const results = await multi.exec()

    if (!results || !results[0]) return 1
    return results[0][1] as number
  }

  async recordTimestampInWindow(
    setKey: string,
    timestamp: number,
    windowSeconds: number
  ): Promise<number> {
    const windowStart = timestamp - windowSeconds * 1000
    const member = `${timestamp}-${Math.random().toString(36).substring(2, 9)}`

    const multi = redis.multi()
    multi.zremrangebyscore(setKey, 0, windowStart)
    multi.zadd(setKey, timestamp, member)
    multi.zcard(setKey)
    multi.expire(setKey, windowSeconds * 2)

    const results = await multi.exec()
    if (!results || !results[2]) return 1
    return results[2][1] as number
  }

  async getSetCardinality(key: string): Promise<number> {
    return await redis.scard(key)
  }

  async addToSetWithTtl(key: string, value: string, ttlSeconds: number): Promise<void> {
    const multi = redis.multi()
    multi.sadd(key, value)
    multi.expire(key, ttlSeconds)
    await multi.exec()
  }

  async getCounter(key: string): Promise<number> {
    const val = await redis.get(key)
    if (!val) return 0
    const parsed = parseInt(val, 10)
    return isNaN(parsed) ? 0 : parsed
  }
}
