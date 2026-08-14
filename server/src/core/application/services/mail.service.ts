import nodemailer from "nodemailer"
import env from "@/configs/env.config"
import logger from "@/configs/logger.config"
import { IMailService } from "../../../modules/auth/application/interfaces"
import transporter from "@/configs/nodemailer.config"
import {
  getVerificationEmailHtml,
  getForgotPasswordEmailHtml,
  getOwnerApprovalEmailHtml,
  getOwnerRejectionEmailHtml,
  getManagerInvitationEmailHtml,
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
    const html = getManagerInvitationEmailHtml({ greeting, stationName: data.stationName, inviteUrl })

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

    logger.info(
      `[DEV FALLBACK] Send email to: ${email} | Subject: ${subject} | Link: ${inviteUrl}`
    )
  }
}
