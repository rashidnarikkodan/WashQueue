import { IDeleteVehicleUseCase } from "../interfaces/vehicle-usecases.interface"
import { IVehicleRepository } from "../../domain/repositories/vehicle.repository"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"

export class DeleteVehicleUseCase implements IDeleteVehicleUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(vehicleId: string, userId: string): Promise<void> {
    const vehicle = await this.vehicleRepository.findById(vehicleId)
    if (!vehicle || !vehicle.data.isActive) {
      throw new NotFoundError("Vehicle not found")
    }

    if (vehicle.userId !== userId) {
      throw new ForbiddenError("You are not authorized to delete this vehicle")
    }

    const wasPrimary = vehicle.data.isPrimary

    // Soft delete
    vehicle.deactivate()
    if (wasPrimary) {
      vehicle.data.isPrimary = false
    }
    
    await this.vehicleRepository.save(vehicle)

    // If it was primary, set another active vehicle as primary
    if (wasPrimary) {
      const activeVehicles = await this.vehicleRepository.findByUserId(userId)
      if (activeVehicles.length > 0) {
        const newPrimary = activeVehicles[0]
        if (newPrimary) {
          newPrimary.setPrimary()
          await this.vehicleRepository.save(newPrimary)
        }
      }
    }
  }
}
