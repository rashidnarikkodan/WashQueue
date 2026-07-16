import { IUpdateCategoryUseCase } from "../interfaces/vehicle-category-usecases.interface"
import { UpdateCategoryInput, CategoryResponseDto } from "../dtos/category.dto"
import { IVehicleCategoryRepository } from "../../domain/repositories/vehicle-category.repsoitory"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ConflictError } from "@/common/errors/conflict-error"

export class UpdateCategoryUseCase implements IUpdateCategoryUseCase {
  constructor(private readonly categoryRepository: IVehicleCategoryRepository) {}

  async execute(id: string, updates: UpdateCategoryInput): Promise<CategoryResponseDto | null> {
    const category = await this.categoryRepository.findById(id)
    if (!category) {
      throw new NotFoundError("Vehicle category not found")
    }

    let nextName = category.name
    let nextSlug = category.slug

    if (updates.name !== undefined && updates.name !== category.name) {
      // Check if duplicate name exists
      const existingByName = await this.categoryRepository.findByName(updates.name)
      if (existingByName && existingByName.id !== id) {
        throw new ConflictError(`Vehicle category with name "${updates.name}" already exists`)
      }
      nextName = updates.name
      if (updates.slug === undefined) {
        // Automatically update slug if slug isn't explicitly overridden
        nextSlug = this.slugify(updates.name)
      }
    }

    if (updates.slug !== undefined && updates.slug !== category.slug) {
      nextSlug = updates.slug
    }

    // If slug changed, verify no duplicate slug exists
    if (nextSlug !== category.slug) {
      const existingBySlug = await this.categoryRepository.findBySlug(nextSlug)
      if (existingBySlug && existingBySlug.id !== id) {
        throw new ConflictError(`Vehicle category with slug "${nextSlug}" already exists`)
      }
    }

    category.rename(nextName, nextSlug)

    if (updates.order !== undefined) {
      category.changeOrder(updates.order)
    }

    const updatedCategory = await this.categoryRepository.save(category)

    return {
      id: updatedCategory.id,
      name: updatedCategory.name,
      slug: updatedCategory.slug,
      order: updatedCategory.order,
    }
  }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
  }
}
