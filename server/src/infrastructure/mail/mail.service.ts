import nodemailer from "nodemailer"
import env from "@/configs/env.config"
import logger from "@/configs/logger.config"

export class MailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    if (env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      })
    this.transporter.verify().then(()=>logger.info('NodeMailer is Running...')).catch(()=>logger.error('NodeMailer is Failed to Run'))
    } else {
      logger.warn("SMTP credentials not provided. MailService running in development/fallback mode.")
    }
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
}
