import crypto from "crypto"
import env from "@/configs/env.config"
import { IBookingReservationRepository } from "../../domain/repositories/booking-reservation.repository"
import { ConfirmBookingReservationUseCase } from "./confirm-booking-reservation.use-case"

export interface RazorpayWebhookPayload {
  event: string
  payload: {
    payment?: {
      entity: {
        id: string
        order_id: string
        amount: number
        status: string
      }
    }
    order?: {
      entity: {
        id: string
        amount: number
        status: string
      }
    }
  }
}

export class ProcessRazorpayWebhookUseCase {
  constructor(
    private readonly reservationRepository: IBookingReservationRepository,
    private readonly confirmReservationUseCase: ConfirmBookingReservationUseCase
  ) {}

  async execute(rawBody: string, signature: string): Promise<{ success: boolean; message: string }> {
    const webhookSecret = env.RAZORPAY_KEY_SECRET

    if (!webhookSecret || !signature) {
      return { success: false, message: "Missing webhook signature configuration" }
    }

    // 1. Verify Webhook Signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex")

    const bufExpected = Buffer.from(expectedSignature, "utf-8")
    const bufSignature = Buffer.from(signature || "", "utf-8")

    const isMatch =
      bufExpected.length === bufSignature.length &&
      crypto.timingSafeEqual(bufExpected, bufSignature)

    if (!isMatch) {
      return { success: false, message: "Invalid webhook signature" }
    }

    const data = JSON.parse(rawBody) as RazorpayWebhookPayload
    const event = data.event

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = data.payload?.payment?.entity
      const orderEntity = data.payload?.order?.entity

      const orderId = paymentEntity?.order_id || orderEntity?.id
      const paymentId = paymentEntity?.id

      if (!orderId) {
        return { success: true, message: "No order ID in webhook payload" }
      }

      const reservation = await this.reservationRepository.findByRazorpayOrderId(orderId)
      if (!reservation) {
        return { success: true, message: "No reservation matching order ID" }
      }

      // Idempotency: If already confirmed, return success
      if (reservation.status === "CONFIRMED") {
        return { success: true, message: "Reservation already confirmed" }
      }

      if (reservation.status === "HELD" && !reservation.isExpired && paymentId) {
        try {
          await this.confirmReservationUseCase.execute({
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
          })
          return { success: true, message: "Booking confirmed via webhook" }
        } catch {
          // If confirmation failed, mark for refund
          reservation.markExpiredRefund(paymentId)
          await this.reservationRepository.save(reservation)
          return { success: true, message: "Booking confirmation failed; marked for refund" }
        }
      } else if (paymentId) {
        reservation.markExpiredRefund(paymentId)
        await this.reservationRepository.save(reservation)
        return { success: true, message: "Expired reservation payment marked for refund" }
      }
    }

    return { success: true, message: "Webhook processed" }
  }
}
