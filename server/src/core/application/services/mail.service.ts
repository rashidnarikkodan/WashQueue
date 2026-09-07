import nodemailer from "nodemailer"
import env from "@/configs/env.config"
import logger from "@/configs/logger.config"
import {
  IMailService,
  BookingConfirmationEmailParams,
  PaymentReceiptEmailParams,
  BookingCancellationEmailParams,
} from "../interfaces/mail.interface"
import transporter from "@/configs/nodemailer.config"
import {
  getVerificationEmailHtml,
  getForgotPasswordEmailHtml,
  getOwnerApprovalEmailHtml,
  getOwnerRejectionEmailHtml,
  getManagerInvitationEmailHtml,
  getBookingConfirmationEmailHtml,
  getPaymentReceiptEmailHtml,
  getBookingCancellationEmailHtml,
} from "../templates"

export class MailService implements IMailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.transporter = transporter
  }

  private isSmtpConfigured(): boolean {
    return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS)
  }

  async sendVerificationEmail(email: string, otp: string): Promise<void> {
    const subject = "WashQueue - Verify Your Account"
    const text = `Welcome to WashQueue! Your verification OTP code is: ${otp}. It will expire in 5 minutes.`
    const html = getVerificationEmailHtml(otp)

    if (this.transporter && this.isSmtpConfigured()) {
      try {
        await this.transporter.sendMail({
          from: `"${env.SMTP_FROM}" <${env.SMTP_USER}>`,
          to: email,
          subject,
          text,
          html,
        })
        logger.info(`Verification email sent to ${email}`)
        return
      } catch (err) {
        logger.error(`SMTP Error sending verification email to ${email}: ${String(err)}`)
      }
    }

    logger.info(`[DEV FALLBACK] Send email to: ${email} | Subject: ${subject} | OTP: ${otp}`)
  }

  async sendForgotPasswordEmail(email: string, otp: string): Promise<void> {
    const subject = "WashQueue - Reset Your Password"
    const text = `You requested a password reset. Your verification OTP code is: ${otp}. It will expire in 5 minutes.`
    const html = getForgotPasswordEmailHtml(otp)

    if (this.transporter && this.isSmtpConfigured()) {
      try {
        await this.transporter.sendMail({
          from: `"${env.SMTP_FROM}" <${env.SMTP_USER}>`,
          to: email,
          subject,
          text,
          html,
        })
        logger.info(`Password reset email sent to ${email}`)
        return
      } catch (err) {
        logger.error(`SMTP Error sending password reset email to ${email}: ${String(err)}`)
      }
    }

    logger.info(`[DEV FALLBACK] Send email to: ${email} | Subject: ${subject} | OTP: ${otp}`)
  }

  async sendOwnerApprovalEmail(email: string, fullName: string): Promise<void> {
    const subject = "WashQueue - Owner Onboarding Application Approved 🎉"
    const text = `Dear ${fullName},\n\nCongratulations! Your application to become a WashQueue Station Owner has been approved and activated by the administrator. You can now log into your dashboard and list your stations.\n\nBest regards,\nThe WashQueue Team`
    const html = getOwnerApprovalEmailHtml(fullName)

    if (this.transporter && this.isSmtpConfigured()) {
      try {
        await this.transporter.sendMail({
          from: `"${env.SMTP_FROM}" <${env.SMTP_USER}>`,
          to: email,
          subject,
          text,
          html,
        })
        logger.info(`Owner approval email sent to ${email}`)
        return
      } catch (err) {
        logger.error(`SMTP Error sending owner approval email to ${email}: ${String(err)}`)
      }
    }

    logger.info(`[DEV FALLBACK] Send email to: ${email} | Subject: ${subject} | Status: Approved`)
  }

  async sendOwnerRejectionEmail(email: string, fullName: string, reason: string): Promise<void> {
    const subject = "WashQueue - Owner Onboarding Application Update"
    const text = `Dear ${fullName},\n\nThank you for your interest in joining WashQueue as a partner. Unfortunately, your application could not be approved at this time.\n\nReason for rejection:\n${reason}\n\nPlease log back into your portal, update your application details, and resubmit.\n\nBest regards,\nThe WashQueue Team`
    const html = getOwnerRejectionEmailHtml(fullName, reason)

    if (this.transporter && this.isSmtpConfigured()) {
      try {
        await this.transporter.sendMail({
          from: `"${env.SMTP_FROM}" <${env.SMTP_USER}>`,
          to: email,
          subject,
          text,
          html,
        })
        logger.info(`Owner rejection email sent to ${email}`)
        return
      } catch (err) {
        logger.error(`SMTP Error sending owner rejection email to ${email}: ${String(err)}`)
      }
    }

    logger.info(
      `[DEV FALLBACK] Send email to: ${email} | Subject: ${subject} | Status: Rejected | Reason: ${reason}`
    )
  }

  async sendManagerInvitationEmail(
    email: string,
    data: { managerName?: string; stationName: string; token: string }
  ): Promise<void> {
    const inviteUrl = `${env.CLIENT_URL}/accept-invitation?token=${data.token}`
    const subject = `WashQueue - Station Manager Invitation for ${data.stationName}`
    const greeting = data.managerName ? `Dear ${data.managerName},` : "Hello,"
    const text = `${greeting}\n\nYou have been invited to manage ${data.stationName} on WashQueue!\n\nPlease accept your invitation by clicking this link: ${inviteUrl}\n\nThis invitation will expire in 7 days.\n\nBest regards,\nThe WashQueue Team`
    const html = getManagerInvitationEmailHtml({
      greeting,
      stationName: data.stationName,
      inviteUrl,
    })

    if (this.transporter && this.isSmtpConfigured()) {
      try {
        await this.transporter.sendMail({
          from: `"${env.SMTP_FROM}" <${env.SMTP_USER}>`,
          to: email,
          subject,
          text,
          html,
        })
        logger.info(`Manager invitation email sent to ${email} for station ${data.stationName}`)
        return
      } catch (err) {
        logger.error(`SMTP Error sending manager invitation email to ${email}: ${String(err)}`)
      }
    }

    logger.info(`[DEV FALLBACK] Send email to: ${email} | Subject: ${subject} | Link: ${inviteUrl}`)
  }

  async sendBookingConfirmationEmail(
    email: string,
    data: BookingConfirmationEmailParams
  ): Promise<void> {
    const subject = `WashQueue - Booking Confirmed (#${data.bookingNumber}) 🚗✨`
    const text = `Hi ${data.customerName},\n\nYour car wash booking (#${data.bookingNumber}) at ${data.stationName} has been confirmed!\n\nService: ${data.serviceType}\nDate & Time: ${data.scheduledDate} (${data.scheduledTime})\nTotal: ₹${data.totalAmount} (${data.paymentMethod} - ${data.paymentStatus})\n\nManage your booking: ${data.bookingUrl || `${env.CLIENT_URL}/bookings`}\n\nBest regards,\nThe WashQueue Team`
    const html = getBookingConfirmationEmailHtml(data)

    if (this.transporter && this.isSmtpConfigured()) {
      try {
        await this.transporter.sendMail({
          from: `"${env.SMTP_FROM}" <${env.SMTP_USER}>`,
          to: email,
          subject,
          text,
          html,
        })
        logger.info(`Booking confirmation email sent to ${email} for #${data.bookingNumber}`)
        return
      } catch (err) {
        logger.error(`SMTP Error sending booking confirmation email to ${email}: ${String(err)}`)
      }
    }

    logger.info(
      `[DEV FALLBACK] Send email to: ${email} | Subject: ${subject} | Booking: #${data.bookingNumber}`
    )
  }

  async sendPaymentReceiptEmail(email: string, data: PaymentReceiptEmailParams): Promise<void> {
    const subject = `WashQueue - Payment Receipt for ₹${data.amount} 💳`
    const text = `Hi ${data.customerName},\n\nThank you for your payment of ₹${data.amount} via ${data.paymentMethod}.\n\nTxn ID: ${data.transactionId}\nDescription: ${data.description}\nDate: ${data.date}\n\nBest regards,\nThe WashQueue Team`
    const html = getPaymentReceiptEmailHtml(data)

    if (this.transporter && this.isSmtpConfigured()) {
      try {
        await this.transporter.sendMail({
          from: `"${env.SMTP_FROM}" <${env.SMTP_USER}>`,
          to: email,
          subject,
          text,
          html,
        })
        logger.info(`Payment receipt email sent to ${email} for Txn ${data.transactionId}`)
        return
      } catch (err) {
        logger.error(`SMTP Error sending payment receipt email to ${email}: ${String(err)}`)
      }
    }

    logger.info(
      `[DEV FALLBACK] Send email to: ${email} | Subject: ${subject} | Txn: ${data.transactionId} | Amount: ₹${data.amount}`
    )
  }

  async sendBookingCancellationEmail(
    email: string,
    data: BookingCancellationEmailParams
  ): Promise<void> {
    const subject = `WashQueue - Booking Cancelled (#${data.bookingNumber})`
    const refundInfo =
      data.refundAmount && data.refundAmount > 0
        ? `\nRefund of ₹${data.refundAmount} has been credited to your WashQueue wallet.`
        : ""
    const text = `Hi ${data.customerName},\n\nYour car wash booking (#${data.bookingNumber}) at ${data.stationName} has been cancelled.\nReason: ${data.reason || "Cancelled"}${refundInfo}\n\nBest regards,\nThe WashQueue Team`
    const html = getBookingCancellationEmailHtml(data)

    if (this.transporter && this.isSmtpConfigured()) {
      try {
        await this.transporter.sendMail({
          from: `"${env.SMTP_FROM}" <${env.SMTP_USER}>`,
          to: email,
          subject,
          text,
          html,
        })
        logger.info(`Booking cancellation email sent to ${email} for #${data.bookingNumber}`)
        return
      } catch (err) {
        logger.error(`SMTP Error sending booking cancellation email to ${email}: ${String(err)}`)
      }
    }

    logger.info(
      `[DEV FALLBACK] Send email to: ${email} | Subject: ${subject} | Booking: #${data.bookingNumber} | Refund: ₹${data.refundAmount || 0}`
    )
  }
}
