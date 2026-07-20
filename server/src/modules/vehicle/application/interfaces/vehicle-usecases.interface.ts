import { CreateVehicleDto } from "../dtos/create-vehicle.dto"
import { UpdateVehicleDto } from "../dtos/update-vehicle.dto"
import { VehicleResponseDto } from "../dtos/get-vehicle.dto"

export interface ICreateVehicleUseCase {
  execute(userId: string, dto: CreateVehicleDto): Promise<VehicleResponseDto>
}

export interface IUpdateVehicleUseCase {
  execute(id: string, userId: string, dto: UpdateVehicleDto): Promise<VehicleResponseDto>
}

export interface IDeleteVehicleUseCase {
  execute(id: string, userId: string): Promise<void>
}

export interface IGetVehicleUseCase {
  execute(id: string, userId: string): Promise<VehicleResponseDto>
}

export interface IGetVehiclesUseCase {
  execute(userId: string): Promise<VehicleResponseDto[]>
}

export interface ISetPrimaryVehicleUseCase {
  execute(id: string, userId: string): Promise<VehicleResponseDto>
}
