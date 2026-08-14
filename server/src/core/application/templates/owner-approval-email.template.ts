export const getOwnerApprovalEmailHtml = (fullName: string): string => {
  return `
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
}
