export interface ManagerInvitationTemplateParams {
  greeting: string
  stationName: string
  inviteUrl: string
}

export const getManagerInvitationEmailHtml = (params: ManagerInvitationTemplateParams): string => {
  const { greeting, stationName, inviteUrl } = params
  return `
      <div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #007bff;">Station Manager Invitation</h2>
        <p>${greeting}</p>
        <p>You have been invited to join WashQueue as the manager for <strong>${stationName}</strong>.</p>
        <p>Click the button below to review and accept your manager invitation:</p>
        <div style="margin: 25px 0;">
          <a href="${inviteUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Accept Invitation</a>
        </div>
        <p style="font-size: 13px; color: #666;">Or copy and paste this link in your browser: <br/><a href="${inviteUrl}" style="color: #007bff;">${inviteUrl}</a></p>
        <br />
        <p style="font-size: 12px; color: #999;">This invitation link will expire in 7 days.</p>
        <p>Best regards,<br/><strong>The WashQueue Team</strong></p>
      </div>
    `
}
