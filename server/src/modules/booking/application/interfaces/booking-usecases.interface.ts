import { FindBookingsFilter } from "../../domain/repositories/booking.repository"
import { BookingListResponseDTO, BookingResponseDTO } from "../dtos/booking-response.dto"
import { CreateBookingInput } from "../dtos/create-booking.dto"
import { CreateWalkInBookingInput } from "../dtos/create-walkin-booking.dto"
import { CancelBookingInput } from "../dtos/cancel-booking.dto"
import { CheckInBookingInput } from "../dtos/checkin-booking.dto"
import {
  CreateBookingReservationInput,
  BookingReservationResponseDTO,
} from "../use-cases/create-booking-reservation.use-case"
import { ConfirmBookingReservationInput } from "../use-cases/confirm-booking-reservation.use-case"
import { RefundPolicyResult } from "../../domain/services/RefundPolicyEngine"
import { ProcessRefundInput } from "../use-cases/evaluate-and-process-refund.use-case"
import { SavePreInspectionInput } from "../use-cases/save-pre-inspection.use-case"
import { OperationalStationQueueDTO } from "../dtos/operational-queue.dto"
import { SavePostInspectionInput } from "../use-cases/save-post-inspection.use-case"
import { StallBookingInput } from "../use-cases/stall-booking.use-case"
import { ResolveStalledBookingInput } from "../use-cases/resolve-stalled-booking.use-case"

export interface ICreateBookingUseCase {
  execute(userId: string, input: CreateBookingInput): Promise<BookingResponseDTO>
}

export interface ICreateWalkInBookingUseCase {
  execute(managerUserId: string, input: CreateWalkInBookingInput): Promise<BookingResponseDTO>
}

export interface IGetBookingUseCase {
  execute(bookingId: string, requestingUserId?: string): Promise<BookingResponseDTO>
}

export interface GetBookingsFilterInput extends FindBookingsFilter {
  type?: "upcoming" | "history" | "all"
}

export interface IGetUserBookingsUseCase {
  execute(
    userId: string,
    filter?: GetBookingsFilterInput,
    role?: string
  ): Promise<BookingListResponseDTO>
}

export interface ICheckInBookingUseCase {
  execute(managerUserId: string, input: CheckInBookingInput): Promise<BookingResponseDTO>
}

export interface ICancelBookingUseCase {
  execute(userId: string, input: CancelBookingInput, userRole?: string): Promise<BookingResponseDTO>
}

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

export interface IValidateQRForCheckInUseCase {
  execute(managerUserId: string, input: CheckInBookingInput): Promise<BookingResponseDTO>
}

export interface ISavePreInspectionAndCheckInUseCase {
  execute(managerUserId: string, input: SavePreInspectionInput): Promise<BookingResponseDTO>
}

export interface IGetOperationalQueueUseCase {
  execute(stationId: string): Promise<OperationalStationQueueDTO>
}

export interface IStartServiceUseCase {
  execute(managerUserId: string, bookingId: string): Promise<BookingResponseDTO>
}

export interface ISavePostInspectionUseCase {
  execute(managerUserId: string, input: SavePostInspectionInput): Promise<BookingResponseDTO>
}

export interface ICompleteHandoverUseCase {
  execute(managerUserId: string, bookingId: string, notes?: string): Promise<BookingResponseDTO>
}

export interface IStallBookingUseCase {
  execute(managerUserId: string, input: StallBookingInput): Promise<BookingResponseDTO>
}

export interface IResolveStalledBookingUseCase {
  execute(managerUserId: string, input: ResolveStalledBookingInput): Promise<BookingResponseDTO>
}