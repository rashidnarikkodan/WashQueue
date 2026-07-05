import redis from "@/infrastructure/cache/redis.client"
import { IOtpService } from "../../application/interfaces/otp-service.interface"

export class OtpService implements IOtpService {
  async generateOtp(email: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const key = `otp:${email.toLowerCase()}`
    await redis.set(key, otp, "EX", 300) // 5 minutes TTL
    return otp
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const key = `otp:${email.toLowerCase()}`
    const storedOtp = await redis.get(key)
    if (storedOtp === otp) {
      await redis.del(key)
      return true
    }
    return false
  }
}
