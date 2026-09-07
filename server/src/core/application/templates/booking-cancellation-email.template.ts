export interface BookingCancellationEmailParams {
  customerName: string
  bookingNumber: string
  stationName: string
  serviceType?: string
  scheduledDate?: string
  reason?: string
  refundAmount?: number
  refundMethod?: string
}

export const getBookingCancellationEmailHtml = (params: BookingCancellationEmailParams): string => {
  const {
    customerName,
    bookingNumber,
    stationName,
    serviceType,
    scheduledDate,
    reason,
    refundAmount = 0,
    refundMethod = "WALLET",
  } = params

  const hasRefund = refundAmount > 0

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #2563eb; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">WashQueue</h1>
        <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Booking Update & Cancellation</p>
      </div>

      <div style="background-color: #ffffff; border-radius: 10px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; background-color: #fef2f2; color: #dc2626; font-weight: 700; font-size: 12px; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
            Booking Cancelled
          </div>
          <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 12px 0 6px 0;">Booking Cancellation Confirmation</h2>
          <p style="color: #64748b; font-size: 14px; margin: 0;">Hi <strong>${customerName}</strong>, your car wash booking has been cancelled.</p>
        </div>

        <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 13px;">Booking Reference:</span>
            <strong style="color: #0f172a; font-size: 14px; font-family: monospace;">#${bookingNumber}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 13px;">Station:</span>
            <strong style="color: #0f172a; font-size: 14px;">${stationName}</strong>
          </div>
          ${
            serviceType
              ? `
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 13px;">Service:</span>
            <strong style="color: #0f172a; font-size: 14px;">${serviceType}</strong>
          </div>
          `
              : ""
          }
          ${
            scheduledDate
              ? `
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 13px;">Scheduled Date:</span>
            <strong style="color: #0f172a; font-size: 14px;">${scheduledDate}</strong>
          </div>
          `
              : ""
          }
          <div style="display: flex; justify-content: space-between; padding-top: 4px;">
            <span style="color: #64748b; font-size: 13px;">Cancellation Reason:</span>
            <span style="color: #0f172a; font-size: 14px;">${reason || "Cancelled by user / station"}</span>
          </div>
        </div>

        ${
          hasRefund
            ? `
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="color: #065f46; font-weight: 700; font-size: 14px;">Refund Processed ✅</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #047857; font-size: 13px;">Refund Amount:</span>
            <strong style="color: #065f46; font-size: 15px;">₹${refundAmount}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #047857; font-size: 13px;">Refund Destination:</span>
            <span style="color: #065f46; font-size: 13px; font-weight: 600;">WashQueue Wallet (${refundMethod})</span>
          </div>
          <p style="color: #047857; font-size: 12px; margin: 8px 0 0 0; line-height: 1.4;">
            The refund amount has been credited to your WashQueue in-app wallet balance and is available immediately for future bookings.
          </p>
        </div>
        `
            : `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
          <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.4;">
            No deposit payment was captured or refund eligibility was subject to cancellation window terms.
          </p>
        </div>
        `
        }
      </div>

      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8;">
        <p style="margin: 0 0 4px 0;">We hope to see you again soon at WashQueue!</p>
        <p style="margin: 0;">© ${new Date().getFullYear()} WashQueue. All rights reserved.</p>
      </div>
    </div>
  `
}
