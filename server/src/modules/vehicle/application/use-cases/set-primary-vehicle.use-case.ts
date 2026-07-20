import { ISetPrimaryVehicleUseCase } from "../interfaces/vehicle-usecases.interface"
import { VehicleResponseDto } from "../dtos/get-vehicle.dto"
import { IVehicleRepository } from "../../domain/repositories/vehicle.repository"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"

export class SetPrimaryVehicleUseCase implements ISetPrimaryVehicleUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(id: string, userId: string): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleRepository.findById(id)
    if (!vehicle || !vehicle.data.isActive) {
      throw new NotFoundError("Vehicle not found")
    }

    if (vehicle.userId !== userId) {
      throw new ForbiddenError("You are not authorized to access this vehicle")
    }

    await this.vehicleRepository.clearPrimaryStatusForUser(userId)

    vehicle.setPrimary()
    const savedVehicle = await this.vehicleRepository.save(vehicle)

    return savedVehicle.data
  }
}
