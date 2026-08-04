import { Station } from "../../domain/entities/Station"
import { CreateStationInput } from "../dtos/create-station.dto"
import { UpdateStationInput } from "../dtos/update-station.dto"
import { StationDetailResponseDto } from "../dtos/get-station.dto"
import { GetStationsQuery } from "../dtos/get-stations.dto"

export interface ICreateStationUseCase {
  execute(userId: string, input: CreateStationInput): Promise<Station>
}

export interface IUpdateStationUseCase {
  execute(stationId: string, userId: string, updates: UpdateStationInput): Promise<StationDetailResponseDto>
}

export interface IGetStationUseCase {
  execute(stationId: string): Promise<StationDetailResponseDto>
}

export interface IGetStationsUseCase {
  execute(query: GetStationsQuery): Promise<{ stations: Station[]; total: number }>
}

export interface ISubmitStationUseCase {
  execute(stationId: string, userId: string): Promise<Station>
}

export interface IDeleteStationUseCase {
  execute(stationId: string, ownerId: string): Promise<void>
}

export interface IReviewStationUseCase {
  execute(stationId: string, action: "APPROVE" | "REJECT" | "SUSPEND", rejectionReason?: string): Promise<Station>
}

export interface IToggleActiveStationUseCase {
  execute(stationId: string, userId: string): Promise<Station>
}

export interface IAssignManagerUseCase {
  execute(
    stationId: string,
    userId: string,
    input: import("../use-cases/assign-manager.usecase").AssignManagerInput
  ): Promise<import("../../domain/entities/Station").StationProps>
}