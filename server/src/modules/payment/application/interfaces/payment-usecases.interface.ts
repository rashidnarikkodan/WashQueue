import { BookingResponseDTO } from "@/modules/booking/application/dtos/booking-response.dto"
import {
  CreateBookingReservationInput,
  BookingReservationResponseDTO,
} from "../use-cases/create-booking-reservation.use-case"
import { ConfirmBookingReservationInput } from "../use-cases/confirm-booking-reservation.use-case"
import { RefundPolicyResult } from "../../domain/services/RefundPolicyEngine"
import { ProcessRefundInput } from "../use-cases/evaluate-and-process-refund.use-case"

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
