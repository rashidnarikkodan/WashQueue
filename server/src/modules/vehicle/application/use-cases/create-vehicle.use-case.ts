import { ICreateVehicleUseCase } from "../interfaces/vehicle-usecases.interface"
import { CreateVehicleDto } from "../dtos/create-vehicle.dto"
import { VehicleResponseDto } from "../dtos/get-vehicle.dto"
import { IVehicleRepository } from "../../domain/repositories/vehicle.repository"
import { Vehicle } from "../../domain/entities/Vehicle"

export class CreateVehicleUseCase implements ICreateVehicleUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(userId: string, dto: CreateVehicleDto): Promise<VehicleResponseDto> {
    const existingVehicles = await this.vehicleRepository.findByUserId(userId)
    const isFirstVehicle = existingVehicles.length === 0
    const shouldBePrimary = isFirstVehicle || dto.isPrimary === true

    if (shouldBePrimary) {
      await this.vehicleRepository.clearPrimaryStatusForUser(userId)
    }

    const vehicle = new Vehicle({
      id: "",
      userId,
      nickname: dto.nickname,
      brand: dto.brand,
      model: dto.model,
      year: dto.year,
      registrationNumber: dto.registrationNumber || null,
      categoryId: dto.categoryId,
      classId: dto.classId,
      isPrimary: shouldBePrimary,
      isActive: true,
      createdAt: new Date(),
    })

    const savedVehicle = await this.vehicleRepository.save(vehicle)
    return savedVehicle.data
  }
}
