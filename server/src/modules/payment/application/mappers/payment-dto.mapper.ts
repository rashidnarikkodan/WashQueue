import { BookingReservationResponseDTO } from "../dtos/payment.dto"
import { BookingResponseDTO } from "@/modules/booking/application/dtos/booking-response.dto"

export interface PaymentOrderDTO {
  order_id: string
  id: string
  amount: number
  currency: string
  reservation_id: string
  wallet_amount?: number
  expires_at: string
}

export interface PaymentVerificationDTO {
  booking: BookingResponseDTO
  order_id: string
  payment_id: string
}

export class PaymentDTOMapper {
  static toOrderDTO(reservation: BookingReservationResponseDTO): PaymentOrderDTO {
    return {
      order_id: reservation.paymentOrderId,
      id: reservation.paymentOrderId,
      amount: reservation.amount,
      currency: reservation.currency,
      reservation_id: reservation.reservationId,
      wallet_amount: reservation.walletAmount,
      expires_at: reservation.expiresAt,
    }
  }

  static toVerificationDTO(
    bookingDto: BookingResponseDTO,
    orderId: string,
    paymentId: string
  ): PaymentVerificationDTO {
    return {
      booking: bookingDto,
      order_id: orderId,
      payment_id: paymentId,
    }
  }
}
