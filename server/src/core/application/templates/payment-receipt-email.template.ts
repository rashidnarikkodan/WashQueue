export interface PaymentReceiptEmailParams {
  customerName: string
  transactionId: string
  amount: number
  paymentMethod: string
  paymentStatus?: string
  date: string
  description: string
  bookingNumber?: string
  stationName?: string
  receiptUrl?: string
}

export const getPaymentReceiptEmailHtml = (params: PaymentReceiptEmailParams): string => {
  const {
    customerName,
    transactionId,
    amount,
    paymentMethod,
    paymentStatus = "SUCCESS",
    date,
    description,
    bookingNumber,
    stationName,
    receiptUrl,
  } = params

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #2563eb; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">WashQueue</h1>
        <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Payment Receipt & Confirmation</p>
      </div>

      <div style="background-color: #ffffff; border-radius: 10px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; background-color: #ecfdf5; color: #059669; font-weight: 700; font-size: 12px; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
            Payment ${paymentStatus}
          </div>
          <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 12px 0 6px 0;">Payment Received 💳</h2>
          <p style="color: #64748b; font-size: 14px; margin: 0;">Hi <strong>${customerName}</strong>, thank you for your payment!</p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
          <span style="color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Amount Paid</span>
          <div style="font-size: 32px; font-weight: 800; color: #059669; margin-top: 4px;">₹${amount}</div>
        </div>

        <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 13px;">Transaction / Reference ID:</span>
            <strong style="color: #0f172a; font-size: 14px; font-family: monospace;">${transactionId}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 13px;">Date:</span>
            <strong style="color: #0f172a; font-size: 14px;">${date}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 13px;">Payment Method:</span>
            <strong style="color: #0f172a; font-size: 14px;">${paymentMethod}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 13px;">Description:</span>
            <strong style="color: #0f172a; font-size: 14px;">${description}</strong>
          </div>
          ${
            bookingNumber
              ? `
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 13px;">Booking Reference:</span>
            <strong style="color: #0f172a; font-size: 14px; font-family: monospace;">#${bookingNumber}</strong>
          </div>
          `
              : ""
          }
          ${
            stationName
              ? `
          <div style="display: flex; justify-content: space-between; padding-top: 4px;">
            <span style="color: #64748b; font-size: 13px;">Station:</span>
            <strong style="color: #0f172a; font-size: 14px;">${stationName}</strong>
          </div>
          `
              : ""
          }
        </div>

        ${
          receiptUrl
            ? `
        <div style="text-align: center; margin: 24px 0 12px 0;">
          <a href="${receiptUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
            View Receipt in Portal
          </a>
        </div>
        `
            : ""
        }
      </div>

      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8;">
        <p style="margin: 0 0 4px 0;">If you have any questions regarding this payment, please contact our support team.</p>
        <p style="margin: 0;">© ${new Date().getFullYear()} WashQueue. All rights reserved.</p>
      </div>
    </div>
  `
}
