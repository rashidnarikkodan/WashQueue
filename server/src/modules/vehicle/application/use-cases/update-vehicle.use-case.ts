import { IUpdateVehicleUseCase } from "../interfaces/vehicle-usecases.interface"
import { UpdateVehicleDto } from "../dtos/update-vehicle.dto"
import { VehicleResponseDto } from "../dtos/get-vehicle.dto"
import { IVehicleRepository } from "../../domain/repositories/vehicle.repository"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"

export class UpdateVehicleUseCase implements IUpdateVehicleUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(id: string, userId: string, dto: UpdateVehicleDto): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleRepository.findById(id)
    if (!vehicle || !vehicle.data.isActive) {
      throw new NotFoundError("Vehicle not found")
    }

    if (vehicle.userId !== userId) {
      throw new ForbiddenError("You are not authorized to update this vehicle")
    }

    const updates: any = {}
    if (dto.nickname !== undefined) updates.nickname = dto.nickname
    if (dto.brand !== undefined) updates.brand = dto.brand
    if (dto.model !== undefined) updates.model = dto.model
    if (dto.year !== undefined) updates.year = dto.year
    if (dto.registrationNumber !== undefined) updates.registrationNumber = dto.registrationNumber
    if (dto.categoryId !== undefined) updates.categoryId = dto.categoryId
    if (dto.classId !== undefined) updates.classId = dto.classId

    const updatedVehicle = await this.vehicleRepository.update(id, updates)
    if (!updatedVehicle) {
      throw new NotFoundError("Vehicle not found")
    }

    return updatedVehicle.data
  }
}
