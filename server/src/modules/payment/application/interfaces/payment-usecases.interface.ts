import { BookingResponseDTO } from "@/modules/booking/application/dtos/booking-response.dto"
import {
  CreateBookingReservationInput,
  BookingReservationResponseDTO,
  ConfirmBookingReservationInput,
  ProcessRefundInput,
} from "../dtos/payment.dto"
import { RefundPolicyResult } from "../../domain/services/RefundPolicyEngine"

export interface ICreateBookingReservationUseCase {
  execute(
    userId: string,
    input: CreateBookingReservationInput
  ): Promise<BookingReservationResponseDTO>
}

export interface IConfirmBookingReservationUseCase {
  execute(input: ConfirmBookingReservationInput): Promise<BookingResponseDTO>
}

export interface ICancelBookingReservationUseCase {
  execute(reservationId: string, userId: string): Promise<void>
}

export interface IProcessRazorpayWebhookUseCase {
  execute(rawBody: string, signature: string): Promise<{ success: boolean; message: string }>
}

export interface ICleanupExpiredReservationsUseCase {
  execute(now?: Date): Promise<number>
}

export interface IEvaluateAndProcessRefundUseCase {
  execute(input: ProcessRefundInput): Promise<RefundPolicyResult>
}
