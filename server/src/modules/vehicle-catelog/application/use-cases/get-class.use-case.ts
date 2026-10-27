import { IGetClassUseCase } from "../interfaces/vehicle-class-usecases.interface"
import { ClassResponseDto } from "../dtos/class.dto"
import { IVehicleClassRepository } from "../../domain/repositories/vehicle-class.repsoitory"
import { NotFoundError } from "@/common/errors/not-found-error"

import { VehicleCatalogDTOMapper } from "../mappers/vehicle-catalog-dto.mapper"

export class GetClassUseCase implements IGetClassUseCase {
  constructor(private readonly classRepository: IVehicleClassRepository) {}

  async execute(id: string): Promise<ClassResponseDto | null> {
    const vehicleClass = await this.classRepository.findById(id)
    if (!vehicleClass) {
      throw new NotFoundError("Vehicle class not found")
    }

    return VehicleCatalogDTOMapper.toClassDTO(vehicleClass)
  }
}
