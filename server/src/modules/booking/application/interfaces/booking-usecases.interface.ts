import { FindBookingsFilter } from "../../domain/repositories/booking.repository"
import { BookingListResponseDTO, BookingResponseDTO } from "../dtos/booking-response.dto"
import { CreateBookingInput } from "../dtos/create-booking.dto"
import { CreateWalkInBookingInput } from "../dtos/create-walkin-booking.dto"
import { CancelBookingInput } from "../dtos/cancel-booking.dto"
import { CheckInBookingInput } from "../dtos/checkin-booking.dto"
import { AdvanceStatusInput } from "../dtos/advance-status.dto"

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

export interface IAdvanceBookingStatusUseCase {
  execute(managerUserId: string, input: AdvanceStatusInput): Promise<BookingResponseDTO>
}

export interface ICancelBookingUseCase {
  execute(userId: string, input: CancelBookingInput, userRole?: string): Promise<BookingResponseDTO>
}
