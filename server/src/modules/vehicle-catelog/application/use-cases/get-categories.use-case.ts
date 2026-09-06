import { IGetCategoriesUseCase } from "../interfaces/vehicle-category-usecases.interface"
import { CategoryResponseDto } from "../dtos/category.dto"
import { IVehicleCategoryRepository } from "../../domain/repositories/vehicle-category.repsoitory"

export class GetCategoriesUseCase implements IGetCategoriesUseCase {
  constructor(private readonly categoryRepository: IVehicleCategoryRepository) {}

  async execute(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.findAll()
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      order: category.order,
      isActive: category.isActive,
    }))
  }
}
