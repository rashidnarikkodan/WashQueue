import { IBookingReservationRepository } from "../../domain/repositories/booking-reservation.repository"
import { IPaymentGatewayService } from "../interfaces/payment-gateway.interface"

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

import { IConfirmBookingReservationUseCase, IProcessRazorpayWebhookUseCase } from "../interfaces/booking-usecases.interface"

export class ProcessRazorpayWebhookUseCase implements IProcessRazorpayWebhookUseCase {
  constructor(
    private readonly reservationRepository: IBookingReservationRepository,
    private readonly confirmReservationUseCase: IConfirmBookingReservationUseCase,
    private readonly paymentGateway: IPaymentGatewayService
  ) {}

  async execute(rawBody: string, signature: string): Promise<{ success: boolean; message: string }> {
    if (!this.paymentGateway.verifyWebhookSignature(rawBody, signature)) {
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

      if (reservation.status === "CONFIRMED") {
        return { success: true, message: "Reservation already confirmed" }
      }

      if (reservation.status === "HELD" && !reservation.isExpired && paymentId) {
        try {
          await this.confirmReservationUseCase.execute({
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
            skipSignatureVerification: true,
          })
          return { success: true, message: "Booking confirmed via webhook" }
        } catch {
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
