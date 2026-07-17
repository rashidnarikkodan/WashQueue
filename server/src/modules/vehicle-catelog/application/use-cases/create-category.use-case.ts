import { ICreateCategoryUseCase } from "../interfaces/vehicle-category-usecases.interface"
import { CreateCategoryInput, CategoryResponseDto } from "../dtos/category.dto"
import { IVehicleCategoryRepository } from "../../domain/repositories/vehicle-category.repsoitory"
import { VehicleCategory } from "../../domain/entities/VehicleCategory"
import { ConflictError } from "@/common/errors/conflict-error"
import { Types } from "mongoose"
import { slugify } from "@/common/utils/slugify"

export class CreateCategoryUseCase implements ICreateCategoryUseCase {
  constructor(private readonly categoryRepository: IVehicleCategoryRepository) {}

  async execute(input: CreateCategoryInput): Promise<CategoryResponseDto> {
    const slug = input.slug || slugify(input.name)

    // Check if category name already exists
    const existingName = await this.categoryRepository.findByName(input.name)
    if (existingName) {
      throw new ConflictError(`Vehicle category with name "${input.name}" already exists`)
    }

    // Check if category slug already exists
    const existingSlug = await this.categoryRepository.findBySlug(slug)
    if (existingSlug) {
      throw new ConflictError(`Vehicle category with slug "${slug}" already exists`)
    }

    const id = new Types.ObjectId().toHexString()
    const category = new VehicleCategory({
      id,
      name: input.name,
      slug,
      order: input.order ?? 0,
      isActive: true
    })

    const savedCategory = await this.categoryRepository.save(category)

    return {
      id: savedCategory.id,
      name: savedCategory.name,
      slug: savedCategory.slug,
      order: savedCategory.order,
      isActive: savedCategory.isActive
    }
  }
}
