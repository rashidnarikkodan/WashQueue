import { FindBookingsFilter } from "../../domain/repositories/booking.repository"
import { BookingListResponseDTO, BookingResponseDTO } from "../dtos/booking-response.dto"
import { CreateBookingInput } from "../dtos/create-booking.dto"
import { CreateWalkInBookingInput } from "../dtos/create-walkin-booking.dto"
import { CancelBookingInput } from "../dtos/cancel-booking.dto"
import { RescheduleBookingInput } from "../dtos/reschedule-booking.dto"

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
  type?: "upcoming" | "history" | "all" | "noshow"
}

export interface IGetUserBookingsUseCase {
  execute(
    userId: string,
    filter?: GetBookingsFilterInput,
    role?: string,
    forceOwnScope?: boolean
  ): Promise<BookingListResponseDTO>
}

export interface ICancelBookingUseCase {
  execute(userId: string, input: CancelBookingInput, userRole?: string): Promise<BookingResponseDTO>
}

export interface IRescheduleBookingUseCase {
  execute(
    userId: string,
    input: RescheduleBookingInput,
    userRole?: string
  ): Promise<BookingResponseDTO>
}
