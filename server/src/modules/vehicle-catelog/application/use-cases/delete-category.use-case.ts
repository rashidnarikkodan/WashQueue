import { IDeleteCategoryUseCase } from "../interfaces/vehicle-category-usecases.interface"
import { IVehicleCategoryRepository } from "../../domain/repositories/vehicle-category.repsoitory"
import { IVehicleClassRepository } from "../../domain/repositories/vehicle-class.repsoitory"
import { NotFoundError } from "@/common/errors/not-found-error"
import { BadRequestError } from "@/common/errors/bad-request-error"

export class DeleteCategoryUseCase implements IDeleteCategoryUseCase {
  constructor(
    private readonly categoryRepository: IVehicleCategoryRepository,
    private readonly classRepository: IVehicleClassRepository
  ) {}

  async execute(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id)
    if (!category) {
      throw new NotFoundError("Vehicle category not found")
    }

    // Integrity check: prevent deletion if classes reference this category
    const linkedClasses = await this.classRepository.findAll({ categoryId: id })
    if (linkedClasses.length > 0) {
      throw new BadRequestError("Cannot delete vehicle category because it has active vehicle classes associated with it")
    }

    await this.categoryRepository.delete(id)
  }
}
