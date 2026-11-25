import { IGetVehiclesUseCase } from "../interfaces/vehicle-usecases.interface"
import { VehicleResponseDto } from "../dtos/get-vehicle.dto"
import { IVehicleRepository } from "../../domain/repositories/vehicle.repository"
import { VehicleDTOMapper } from "../mappers/vehicle-dto.mapper"

export class GetVehiclesUseCase implements IGetVehiclesUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(userId: string): Promise<VehicleResponseDto[]> {
    const vehicles = await this.vehicleRepository.findByUserId(userId)
    return VehicleDTOMapper.toListDTO(vehicles)
  }
}
