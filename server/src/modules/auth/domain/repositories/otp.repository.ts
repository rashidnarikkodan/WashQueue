import { Otp } from "../entities/otp.entity"

export interface IOtpRepository {
  save(otp: Otp): Promise<void>
  findByEmail(email: string): Promise<Otp | null>
  delete(email: string): Promise<void>
}
