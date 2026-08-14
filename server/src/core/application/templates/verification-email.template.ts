export const getVerificationEmailHtml = (otp: string): string => {
  return `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Welcome to WashQueue!</h2>
        <p>Thank you for registering. Please verify your account using the OTP code below:</p>
        <div style="font-size: 24px; font-weight: bold; padding: 10px; background-color: #f0f0f0; display: inline-block; border-radius: 4px; letter-spacing: 2px; color: #007bff;">
          ${otp}
        </div>
        <p>This code will expire in 5 minutes. If you did not request this code, please ignore this email.</p>
      </div>
    `
}
