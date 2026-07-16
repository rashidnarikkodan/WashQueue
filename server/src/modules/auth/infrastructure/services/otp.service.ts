import { IOtpService } from "../../application/interfaces/otp-service.interface"
import { IOtpRepository } from "../../domain/repositories/otp.repository"

export class OtpService implements IOtpService {
  constructor(private readonly otpRepository: IOtpRepository) {}

  async generateOtp(_email: string): Promise<string> {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const storedOtp = await this.otpRepository.findByEmail(email)
    if (!storedOtp) return false
    const isValid = storedOtp.verify(otp)
    if (isValid) {
      await this.otpRepository.delete(email)
    }
    return isValid
  }
}

