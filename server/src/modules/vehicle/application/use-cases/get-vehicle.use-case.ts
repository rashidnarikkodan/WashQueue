import { IGetVehicleUseCase } from "../interfaces/vehicle-usecases.interface"
import { VehicleResponseDto } from "../dtos/get-vehicle.dto"
import { IVehicleRepository } from "../../domain/repositories/vehicle.repository"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"

export class GetVehicleUseCase implements IGetVehicleUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(id: string, userId: string): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleRepository.findById(id)
    if (!vehicle || !vehicle.data.isActive) {
      throw new NotFoundError("Vehicle not found")
    }

    if (vehicle.userId !== userId) {
      throw new ForbiddenError("You are not authorized to view this vehicle")
    }

    return vehicle.data
  }
}
