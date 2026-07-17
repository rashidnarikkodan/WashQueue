import { IOtpRepository } from "../../domain/repositories/otp.repository"
import { Otp } from "../../domain/entities/otp.entity"
import redis from "@/infrastructure/cache/redis.client"

export class OtpRedisRepository implements IOtpRepository {
  async save(otp: Otp): Promise<void> {
    const key = `otp:${otp.email.toLowerCase()}`
    const ttl = Math.max(0, Math.ceil((otp.expiresAt.getTime() - Date.now()) / 1000))
    await redis.set(key, otp.code, "EX", ttl)
  }

  async findByEmail(email: string): Promise<Otp | null> {
    const key = `otp:${email.toLowerCase()}`
    const code = await redis.get(key)
    if (!code) {
      return null
    }
    const ttl = await redis.ttl(key)
    const expiresAt = new Date(Date.now() + (ttl > 0 ? ttl : 300) * 1000)
    return new Otp({ email, code, expiresAt })
  }

  async delete(email: string): Promise<void> {
    const key = `otp:${email.toLowerCase()}`
    await redis.del(key)
  }
}
