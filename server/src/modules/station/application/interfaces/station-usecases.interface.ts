import { Station } from "../../domain/entities/Station"
import { CreateStationInput } from "../dtos/create-station.dto"
import { UpdateStationInput } from "../dtos/update-station.dto"

export interface ICreateStationUseCase {
  execute(input: CreateStationInput): Promise<Station>
}

export interface IUpdateStationUseCase {
  execute(stationId: string, ownerId: string, updates: UpdateStationInput): Promise<Station>
}

export interface IGetStationUseCase {
  execute(stationId: string, ownerId: string): Promise<Station>
}

export interface IGetStationsUseCase {
  execute(ownerId: string): Promise<Station[]>
}

export interface ISubmitStationUseCase {
  execute(stationId: string, ownerId: string): Promise<Station>
}