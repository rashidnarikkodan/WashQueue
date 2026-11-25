import { IGetClassesUseCase } from "../interfaces/vehicle-class-usecases.interface"
import { ClassResponseDto } from "../dtos/class.dto"
import { IVehicleClassRepository } from "../../domain/repositories/vehicle-class.repsoitory"

import { VehicleCatalogDTOMapper } from "../mappers/vehicle-catalog-dto.mapper"

export class GetClassesUseCase implements IGetClassesUseCase {
  constructor(private readonly classRepository: IVehicleClassRepository) {}

  async execute(filter?: { categoryId?: string }): Promise<ClassResponseDto[]> {
    const classes = await this.classRepository.findAll(filter)
    return VehicleCatalogDTOMapper.toClassListDTO(classes)
  }
}
