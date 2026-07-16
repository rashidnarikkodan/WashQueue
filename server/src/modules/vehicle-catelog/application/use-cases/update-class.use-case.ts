import { IUpdateClassUseCase } from "../interfaces/vehicle-class-usecases.interface"
import { UpdateClassInput, ClassResponseDto } from "../dtos/class.dto"
import { IVehicleClassRepository } from "../../domain/repositories/vehicle-class.repsoitory"
import { IVehicleCategoryRepository } from "../../domain/repositories/vehicle-category.repsoitory"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ConflictError } from "@/common/errors/conflict-error"

export class UpdateClassUseCase implements IUpdateClassUseCase {
  constructor(
    private readonly classRepository: IVehicleClassRepository,
    private readonly categoryRepository: IVehicleCategoryRepository
  ) {}

  async execute(id: string, updates: UpdateClassInput): Promise<ClassResponseDto | null> {
    const vehicleClass = await this.classRepository.findById(id)
    if (!vehicleClass) {
      throw new NotFoundError("Vehicle class not found")
    }

    if (updates.categoryId !== undefined && updates.categoryId !== vehicleClass.categoryId) {
      const category = await this.categoryRepository.findById(updates.categoryId)
      if (!category) {
        throw new NotFoundError("Vehicle category not found")
      }
      vehicleClass.changeCategory(updates.categoryId)
    }

    let nextName = vehicleClass.name
    let nextSlug = vehicleClass.slug

    if (updates.name !== undefined && updates.name !== vehicleClass.name) {
      const existingByName = await this.classRepository.findByName(updates.name)
      if (existingByName && existingByName.id !== id) {
        throw new ConflictError(`Vehicle class with name "${updates.name}" already exists`)
      }
      nextName = updates.name
      if (updates.slug === undefined) {
        nextSlug = this.slugify(updates.name)
      }
    }

    if (updates.slug !== undefined && updates.slug !== vehicleClass.slug) {
      nextSlug = updates.slug
    }

    if (nextSlug !== vehicleClass.slug) {
      const existingBySlug = await this.classRepository.findBySlug(nextSlug)
      if (existingBySlug && existingBySlug.id !== id) {
        throw new ConflictError(`Vehicle class with slug "${nextSlug}" already exists`)
      }
    }

    vehicleClass.rename(nextName, nextSlug)

    if (updates.order !== undefined) {
      vehicleClass.changeOrder(updates.order)
    }

    const updatedClass = await this.classRepository.save(vehicleClass)

    return {
      id: updatedClass.id,
      categoryId: updatedClass.categoryId,
      name: updatedClass.name,
      slug: updatedClass.slug,
      order: updatedClass.order,
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
