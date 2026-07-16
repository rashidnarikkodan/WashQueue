import nodemailer from "nodemailer"
import env from "@/configs/env.config"
import logger from "@/configs/logger.config"
import { IMailService } from "../../application/interfaces"
import transporter from "@/configs/mail.config"

export class MailService implements IMailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.transporter = transporter
  }

  async sendVerificationEmail(email: string, otp: string): Promise<void> {
    const subject = "WashQueue - Verify Your Account"
    const text = `Welcome to WashQueue! Your verification OTP code is: ${otp}. It will expire in 5 minutes.`
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Welcome to WashQueue!</h2>
        <p>Thank you for registering. Please verify your account using the OTP code below:</p>
        <div style="font-size: 24px; font-weight: bold; padding: 10px; background-color: #f0f0f0; display: inline-block; border-radius: 4px; letter-spacing: 2px; color: #007bff;">
          ${otp}
        </div>
        <p>This code will expire in 5 minutes. If you did not request this code, please ignore this email.</p>
      </div>
    `

    if (this.transporter) {
      await this.transporter.sendMail({
        from: `"${env.SMTP_FROM}" <${env.SMTP_USER}>`,
        to: email,
        subject,
        text,
        html,
      })
      logger.info(`Verification email sent to ${email}`)
    } else {
      logger.info(`[DEV FALLBACK] Send email to: ${email} | Subject: ${subject} | OTP: ${otp}`)
    }
  }

  async sendForgotPasswordEmail(email: string, otp: string): Promise<void> {
    const subject = "WashQueue - Reset Your Password"
    const text = `You requested a password reset. Your verification OTP code is: ${otp}. It will expire in 5 minutes.`
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Reset Your Password</h2>
        <p>Please use the OTP code below to reset your password:</p>
        <div style="font-size: 24px; font-weight: bold; padding: 10px; background-color: #f0f0f0; display: inline-block; border-radius: 4px; letter-spacing: 2px; color: #007bff;">
          ${otp}
        </div>
        <p>This code will expire in 5 minutes. If you did not request this code, please ignore this email.</p>
      </div>
    `

    if (this.transporter) {
      await this.transporter.sendMail({
        from: `"${env.SMTP_FROM}" <${env.SMTP_USER}>`,
        to: email,
        subject,
        text,
        html,
      })
      logger.info(`Password reset email sent to ${email}`)
    } else {
      logger.info(`[DEV FALLBACK] Send email to: ${email} | Subject: ${subject} | OTP: ${otp}`)
    }
  }

  async sendOwnerApprovalEmail(email: string, fullName: string): Promise<void> {
    const subject = "WashQueue - Owner Onboarding Application Approved 🎉"
    const text = `Dear ${fullName},\n\nCongratulations! Your application to become a WashQueue Station Owner has been approved and activated by the administrator. You can now log into your dashboard and list your stations.\n\nBest regards,\nThe WashQueue Team`
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.5;">
        <h2 style="color: #2e7d32;">Application Approved! 🎉</h2>
        <p>Dear <strong>${fullName}</strong>,</p>
        <p>Congratulations! We are pleased to inform you that your application to become a <strong>WashQueue Station Owner</strong> has been approved and activated by the administrator.</p>
        <p>You can now log in to the WashQueue Owner Portal to configure and list your car wash stations, manage bookings, and view payouts.</p>
        <br />
        <p>Best regards,</p>
        <p><strong>The WashQueue Team</strong></p>
      </div>
    `

    if (this.transporter) {
      await this.transporter.sendMail({
        from: `"${env.SMTP_FROM}" <${env.SMTP_USER}>`,
        to: email,
        subject,
        text,
        html,
      })
      logger.info(`Owner approval email sent to ${email}`)
    } else {
      logger.info(`[DEV FALLBACK] Send email to: ${email} | Subject: ${subject} | Status: Approved`)
    }
  }

  async sendOwnerRejectionEmail(email: string, fullName: string, reason: string): Promise<void> {
    const subject = "WashQueue - Owner Onboarding Application Update"
    const text = `Dear ${fullName},\n\nThank you for your interest in joining WashQueue as a partner. Unfortunately, your application could not be approved at this time.\n\nReason for rejection:\n${reason}\n\nPlease log back into your portal, update your application details, and resubmit.\n\nBest regards,\nThe WashQueue Team`
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.5;">
        <h2 style="color: #c62828;">Owner Onboarding Application Update</h2>
        <p>Dear <strong>${fullName}</strong>,</p>
        <p>Thank you for your interest in joining WashQueue as a partner.</p>
        <p>Unfortunately, your application to become a WashQueue Station Owner could not be approved at this time for the following reason:</p>
        <div style="padding: 15px; border-left: 4px solid #c62828; bg-color: #ffebee; margin: 15px 0; font-style: italic; color: #555;">
          ${reason}
        </div>
        <p>Please log back into the Owner Portal to correct the issues, re-upload documents if necessary, and resubmit your application for review.</p>
        <br />
        <p>Best regards,</p>
        <p><strong>The WashQueue Team</strong></p>
      </div>
    `

    if (this.transporter) {
      await this.transporter.sendMail({
        from: `"${env.SMTP_FROM}" <${env.SMTP_USER}>`,
        to: email,
        subject,
        text,
        html,
      })
      logger.info(`Owner rejection email sent to ${email}`)
    } else {
      logger.info(
        `[DEV FALLBACK] Send email to: ${email} | Subject: ${subject} | Status: Rejected | Reason: ${reason}`
      )
    }
  }
}
