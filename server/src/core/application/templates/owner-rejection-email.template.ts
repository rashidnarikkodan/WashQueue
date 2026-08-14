export const getOwnerRejectionEmailHtml = (fullName: string, reason: string): string => {
  return `
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
}
