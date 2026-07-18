import { Station } from "../../domain/entities/Station"
import { CreateStationInput } from "../dtos/create-station.dto"
import { UpdateStationInput } from "../dtos/update-station.dto"
import { StationDetailResponseDto } from "../dtos/get-station.dto"

export interface ICreateStationUseCase {
  execute(input: CreateStationInput): Promise<Station>
}

export interface IUpdateStationUseCase {
  execute(stationId: string, providerId: string, updates: UpdateStationInput): Promise<StationDetailResponseDto>
}

export interface IGetStationUseCase {
  execute(stationId: string, providerId: string): Promise<StationDetailResponseDto>
}

export interface IGetStationsUseCase {
  execute(providerId: string): Promise<Station[]>
}

export interface ISubmitStationUseCase {
  execute(stationId: string, providerId: string): Promise<Station>
}