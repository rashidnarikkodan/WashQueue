export interface IMailService {
  sendVerificationEmail(email: string, otp: string): Promise<void>
  sendForgotPasswordEmail(email: string, otp: string): Promise<void>
}
