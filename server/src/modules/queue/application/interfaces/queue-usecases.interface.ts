import { BookingResponseDTO } from "@/modules/booking/application/dtos/booking-response.dto"
import { CheckInBookingInput } from "../dtos/checkin-booking.dto"
import { OperationalStationQueueDTO } from "../dtos/operational-queue.dto"
import { SavePreInspectionInput } from "../use-cases/save-pre-inspection.use-case"
import { SavePostInspectionInput } from "../use-cases/save-post-inspection.use-case"
import { StallBookingInput } from "../use-cases/stall-booking.use-case"
import { ResolveStalledBookingInput } from "../use-cases/resolve-stalled-booking.use-case"
import { PublicStationQueueDTO } from "../use-cases/get-public-station-queue.use-case"
import { ProcessNoShowResult } from "../use-cases/process-no-show-bookings.use-case"

export interface IValidateQRForCheckInUseCase {
  execute(managerUserId: string, input: CheckInBookingInput): Promise<BookingResponseDTO>
}

export interface ISavePreInspectionAndCheckInUseCase {
  execute(managerUserId: string, input: SavePreInspectionInput): Promise<BookingResponseDTO>
}

export interface IGetOperationalQueueUseCase {
  execute(managerUserId: string, stationId: string): Promise<OperationalStationQueueDTO>
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

export interface IGetPublicStationQueueUseCase {
  execute(stationId: string): Promise<PublicStationQueueDTO>
}

export interface IProcessNoShowBookingsUseCase {
  execute(gracePeriodMinutes?: number): Promise<ProcessNoShowResult>
}
