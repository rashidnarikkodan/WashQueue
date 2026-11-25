import { IGetCategoryUseCase } from "../interfaces/vehicle-category-usecases.interface"
import { CategoryResponseDto } from "../dtos/category.dto"
import { IVehicleCategoryRepository } from "../../domain/repositories/vehicle-category.repsoitory"
import { NotFoundError } from "@/common/errors/not-found-error"

import { VehicleCatalogDTOMapper } from "../mappers/vehicle-catalog-dto.mapper"

export class GetCategoryUseCase implements IGetCategoryUseCase {
  constructor(private readonly categoryRepository: IVehicleCategoryRepository) {}

  async execute(id: string): Promise<CategoryResponseDto | null> {
    const category = await this.categoryRepository.findById(id)
    if (!category) {
      throw new NotFoundError("Vehicle category not found")
    }

    return VehicleCatalogDTOMapper.toCategoryDTO(category)
  }
}
