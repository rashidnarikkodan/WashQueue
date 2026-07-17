export interface IMailService {
  sendVerificationEmail(email: string, otp: string): Promise<void>
  sendForgotPasswordEmail(email: string, otp: string): Promise<void>
  sendOwnerApprovalEmail(email: string, fullName: string): Promise<void>
  sendOwnerRejectionEmail(email: string, fullName: string, reason: string): Promise<void>
}
