import {
  BookingConfirmationEmailParams,
  PaymentReceiptEmailParams,
  BookingCancellationEmailParams,
} from "../templates"

export type {
  BookingConfirmationEmailParams,
  PaymentReceiptEmailParams,
  BookingCancellationEmailParams,
}

export interface IMailService {
  sendVerificationEmail(email: string, otp: string): Promise<void>
  sendForgotPasswordEmail(email: string, otp: string): Promise<void>
  sendOwnerApprovalEmail(email: string, fullName: string): Promise<void>
  sendOwnerRejectionEmail(email: string, fullName: string, reason: string): Promise<void>
  sendManagerInvitationEmail(
    email: string,
    data: { managerName?: string; stationName: string; token: string }
  ): Promise<void>
  sendBookingConfirmationEmail(email: string, data: BookingConfirmationEmailParams): Promise<void>
  sendPaymentReceiptEmail(email: string, data: PaymentReceiptEmailParams): Promise<void>
  sendBookingCancellationEmail(email: string, data: BookingCancellationEmailParams): Promise<void>
}
