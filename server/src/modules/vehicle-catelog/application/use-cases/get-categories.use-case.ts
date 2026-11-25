import { IGetCategoriesUseCase } from "../interfaces/vehicle-category-usecases.interface"
import { CategoryResponseDto } from "../dtos/category.dto"
import { IVehicleCategoryRepository } from "../../domain/repositories/vehicle-category.repsoitory"

import { VehicleCatalogDTOMapper } from "../mappers/vehicle-catalog-dto.mapper"

export class GetCategoriesUseCase implements IGetCategoriesUseCase {
  constructor(private readonly categoryRepository: IVehicleCategoryRepository) {}

  async execute(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.findAll()
    return VehicleCatalogDTOMapper.toCategoryListDTO(categories)
  }
}
