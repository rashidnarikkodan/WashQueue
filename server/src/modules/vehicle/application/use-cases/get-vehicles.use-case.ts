import { IGetVehiclesUseCase } from "../interfaces/vehicle-usecases.interface"
import { VehicleResponseDto } from "../dtos/get-vehicle.dto"
import { IVehicleRepository } from "../../domain/repositories/vehicle.repository"

export class GetVehiclesUseCase implements IGetVehiclesUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(userId: string): Promise<VehicleResponseDto[]> {
    const vehicles = await this.vehicleRepository.findByUserId(userId)
    return vehicles.map((v) => v.data)
  }
}
