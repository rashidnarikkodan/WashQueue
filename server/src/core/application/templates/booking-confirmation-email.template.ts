export interface BookingConfirmationEmailParams {
  customerName: string
  bookingNumber: string
  stationName: string
  serviceType: string
  scheduledDate: string
  scheduledTime: string
  totalAmount: number
  paymentMethod: string
  paymentStatus: string
  bookingUrl?: string
}

export const getBookingConfirmationEmailHtml = (params: BookingConfirmationEmailParams): string => {
  const {
    customerName,
    bookingNumber,
    stationName,
    serviceType,
    scheduledDate,
    scheduledTime,
    totalAmount,
    paymentMethod,
    paymentStatus,
    bookingUrl,
  } = params

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #2563eb; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">WashQueue</h1>
        <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Smart Car Wash Queue & Booking</p>
      </div>

      <div style="background-color: #ffffff; border-radius: 10px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; background-color: #ecfdf5; color: #059669; font-weight: 700; font-size: 12px; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
            Booking Confirmed
          </div>
          <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 12px 0 6px 0;">Your Wash is Booked! 🚗✨</h2>
          <p style="color: #64748b; font-size: 14px; margin: 0;">Hi <strong>${customerName}</strong>, your reservation has been confirmed.</p>
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
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 13px;">Service Package:</span>
            <strong style="color: #0f172a; font-size: 14px;">${serviceType}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 13px;">Date & Time:</span>
            <strong style="color: #0f172a; font-size: 14px;">${scheduledDate} (${scheduledTime})</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 13px;">Payment Method:</span>
            <span style="color: #0f172a; font-size: 14px; font-weight: 600;">${paymentMethod} (${paymentStatus})</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 4px;">
            <span style="color: #0f172a; font-weight: 700; font-size: 14px;">Total Amount:</span>
            <strong style="color: #2563eb; font-size: 16px;">₹${totalAmount}</strong>
          </div>
        </div>

        ${
          bookingUrl
            ? `
        <div style="text-align: center; margin: 24px 0 12px 0;">
          <a href="${bookingUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
            View Booking & Check-In QR
          </a>
        </div>
        `
            : ""
        }

        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; margin-top: 20px;">
          <p style="color: #1e40af; font-size: 13px; margin: 0; line-height: 1.4;">
            <strong>Arrival Tip:</strong> Please arrive 5–10 minutes prior to your time window. Show your QR code at the station kiosk or to station staff to enter the queue.
          </p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8;">
        <p style="margin: 0 0 4px 0;">Need to reschedule or cancel? You can manage your booking directly in the app.</p>
        <p style="margin: 0;">© ${new Date().getFullYear()} WashQueue. All rights reserved.</p>
      </div>
    </div>
  `
}
