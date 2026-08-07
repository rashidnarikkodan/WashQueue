import { ConflictError } from "@/common/errors/conflict-error"
import { NotFoundError } from "@/common/errors/not-found-error"

import { CategoryResponseDto, UpdateCategoryInput } from "../dtos/category.dto"

import { IUpdateCategoryUseCase } from "../interfaces/vehicle-category-usecases.interface"
import { IVehicleCategoryRepository } from "../../domain/repositories/vehicle-category.repsoitory"

export class UpdateCategoryUseCase implements IUpdateCategoryUseCase {
  constructor(private readonly categoryRepository: IVehicleCategoryRepository) {}

  async execute(id: string, updates: UpdateCategoryInput): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findById(id)

    if (!category) {
      throw new NotFoundError("Vehicle category not found")
    }

    if (updates.name !== undefined && updates.name !== category.name) {
      const existing = await this.categoryRepository.findByName(updates.name)

      if (existing && existing.id !== category.id) {
        throw new ConflictError(`Vehicle category "${updates.name}" already exists`)
      }

      category.rename(updates.name)
      const existBySlug = await this.categoryRepository.findBySlug(category.slug)
      if (existBySlug && existBySlug.id !== category.id) {
        throw new ConflictError(`Category Slug "${updates.slug}" already exists`)
      }
    }

    if (updates.description !== undefined && updates.description !== category.description) {
      category.changeDescription(updates.description)
    }

    if (updates.order !== undefined && updates.order !== category.order) {
      category.changeOrder(updates.order)
    }

    if (updates.isActive !== undefined && updates.isActive !== category.isActive) {
      category.changeStatus(updates.isActive)
    }

    const updated = await this.categoryRepository.save(category)

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      order: updated.order,
      isActive: updated.isActive,
    }
  }
}
