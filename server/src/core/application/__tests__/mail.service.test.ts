import { describe, it, expect, vi, beforeEach } from "vitest"
import { MailService } from "../services/mail.service"
import {
  getBookingConfirmationEmailHtml,
  getPaymentReceiptEmailHtml,
  getBookingCancellationEmailHtml,
} from "../templates"

vi.mock("@/configs/nodemailer.config", () => ({
  default: {
    sendMail: vi.fn(),
  },
}))

describe("Email Templates & MailService Tests", () => {
  describe("Email Templates", () => {
    it("should generate valid Booking Confirmation HTML", () => {
      const html = getBookingConfirmationEmailHtml({
        customerName: "Alex Doe",
        bookingNumber: "WQ-123456",
        stationName: "Express Wash Downtown",
        serviceType: "Premium Foam Wash",
        scheduledDate: "10/09/2026",
        scheduledTime: "10:30 AM",
        totalAmount: 499,
        paymentMethod: "WALLET",
        paymentStatus: "PAID",
        bookingUrl: "https://washqueue.app/bookings/b-123",
      })

      expect(html).toContain("Alex Doe")
      expect(html).toContain("WQ-123456")
      expect(html).toContain("Express Wash Downtown")
      expect(html).toContain("Premium Foam Wash")
      expect(html).toContain("₹499")
      expect(html).toContain("WALLET (PAID)")
      expect(html).toContain("https://washqueue.app/bookings/b-123")
    })

    it("should generate valid Payment Receipt HTML", () => {
      const html = getPaymentReceiptEmailHtml({
        customerName: "Alex Doe",
        transactionId: "TXN-987654",
        amount: 500,
        paymentMethod: "RAZORPAY",
        paymentStatus: "SUCCESS",
        date: "10/09/2026",
        description: "Wallet Top-Up",
        bookingNumber: "WQ-123456",
        stationName: "Express Wash Downtown",
        receiptUrl: "https://washqueue.app/wallet",
      })

      expect(html).toContain("Alex Doe")
      expect(html).toContain("TXN-987654")
      expect(html).toContain("₹500")
      expect(html).toContain("RAZORPAY")
      expect(html).toContain("Wallet Top-Up")
      expect(html).toContain("WQ-123456")
      expect(html).toContain("Express Wash Downtown")
      expect(html).toContain("https://washqueue.app/wallet")
    })

    it("should generate valid Booking Cancellation & Refund HTML", () => {
      const htmlWithRefund = getBookingCancellationEmailHtml({
        customerName: "Alex Doe",
        bookingNumber: "WQ-123456",
        stationName: "Express Wash Downtown",
        serviceType: "Premium Foam Wash",
        scheduledDate: "10/09/2026",
        reason: "Change of plans",
        refundAmount: 400,
        refundMethod: "WALLET",
      })

      expect(htmlWithRefund).toContain("Alex Doe")
      expect(htmlWithRefund).toContain("WQ-123456")
      expect(htmlWithRefund).toContain("Express Wash Downtown")
      expect(htmlWithRefund).toContain("Change of plans")
      expect(htmlWithRefund).toContain("₹400")
      expect(htmlWithRefund).toContain("Refund Processed ✅")

      const htmlWithoutRefund = getBookingCancellationEmailHtml({
        customerName: "Alex Doe",
        bookingNumber: "WQ-123456",
        stationName: "Express Wash Downtown",
        reason: "No show",
        refundAmount: 0,
      })

      expect(htmlWithoutRefund).toContain("No deposit payment was captured")
    })
  })

  describe("MailService Methods", () => {
    let mailService: MailService

    beforeEach(() => {
      vi.clearAllMocks()
      mailService = new MailService()
    })

    it("should send booking confirmation email or fallback gracefully", async () => {
      await expect(
        mailService.sendBookingConfirmationEmail("test@example.com", {
          customerName: "Alex Doe",
          bookingNumber: "WQ-123456",
          stationName: "Express Wash Downtown",
          serviceType: "Premium Wash",
          scheduledDate: "10/09/2026",
          scheduledTime: "11:00 AM",
          totalAmount: 350,
          paymentMethod: "PAY_AT_STATION",
          paymentStatus: "PENDING",
        })
      ).resolves.toBeUndefined()
    })

    it("should send payment receipt email or fallback gracefully", async () => {
      await expect(
        mailService.sendPaymentReceiptEmail("test@example.com", {
          customerName: "Alex Doe",
          transactionId: "TXN-123",
          amount: 350,
          paymentMethod: "ONLINE",
          date: "10/09/2026",
          description: "Online Booking Payment",
        })
      ).resolves.toBeUndefined()
    })

    it("should send booking cancellation email or fallback gracefully", async () => {
      await expect(
        mailService.sendBookingCancellationEmail("test@example.com", {
          customerName: "Alex Doe",
          bookingNumber: "WQ-123456",
          stationName: "Express Wash Downtown",
          reason: "Customer requested cancellation",
          refundAmount: 200,
          refundMethod: "WALLET",
        })
      ).resolves.toBeUndefined()
    })
  })
})
