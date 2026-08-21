import { Station, StationProps } from "../../domain/entities/Station"
import { CreateStationInput } from "../dtos/create-station.dto"
import { UpdateStationInput } from "../dtos/update-station.dto"
import { StationDetailResponseDto } from "../dtos/get-station.dto"
import { GetStationsQuery, StationStatusCounts } from "../dtos/get-stations.dto"
import { StationFilterOptionsDTO } from "../dtos/station-filter-options.dto"
import { ConfigureSlotConfigInput, SlotConfigResponseDTO } from "../dtos/slot-config.dto"
import { TimeWindowInstance } from "../../domain/entities/TimeWindowInstance"
import { AvailableTimeWindowsResponseDTO } from "../dtos/available-time-windows.dto"
import { BookingCalendarResponseDTO } from "../dtos/booking-calendar.dto"
import { AssignManagerInput } from "../use-cases/assign-manager.usecase"

export interface ICreateStationUseCase {
  execute(userId: string, input: CreateStationInput): Promise<Station>
}

export interface IUpdateStationUseCase {
  execute(
    stationId: string,
    userId: string,
    updates: UpdateStationInput
  ): Promise<StationDetailResponseDto>
}

export interface IGetStationUseCase {
  execute(stationId: string): Promise<StationDetailResponseDto>
}

export interface IGetStationsUseCase {
  execute(
    query: GetStationsQuery,
    userId?: string
  ): Promise<{ stations: Station[]; total: number; statusCounts?: StationStatusCounts }>
}

export interface ISubmitStationUseCase {
  execute(stationId: string, userId: string): Promise<Station>
}

export interface IDeleteStationUseCase {
  execute(stationId: string, ownerId: string): Promise<void>
}

export interface IReviewStationUseCase {
  execute(
    stationId: string,
    action: "APPROVE" | "REJECT" | "SUSPEND",
    rejectionReason?: string
  ): Promise<Station>
}

export interface IToggleActiveStationUseCase {
  execute(stationId: string, userId: string): Promise<Station>
}

export interface IAssignManagerUseCase {
  execute(
    stationId: string,
    userId: string,
    input: AssignManagerInput
  ): Promise<StationProps>
}

export interface IGetStationFilterOptionsUseCase {
  execute(): Promise<StationFilterOptionsDTO>
}

export interface IConfigureSlotConfigUseCase {
  execute(input: ConfigureSlotConfigInput): Promise<SlotConfigResponseDTO>
}

export interface IGenerateTimeWindowsUseCase {
  execute(stationId: string, forceRegenerate?: boolean): Promise<TimeWindowInstance[]>
}

export interface IGetAvailableTimeWindowsUseCase {
  execute(stationId: string, date: string): Promise<AvailableTimeWindowsResponseDTO>
}

export interface IGetBookingCalendarUseCase {
  execute(stationId: string): Promise<BookingCalendarResponseDTO>
}

export interface IGetSlotConfigUseCase {
  execute(stationId: string): Promise<SlotConfigResponseDTO | null>
}
