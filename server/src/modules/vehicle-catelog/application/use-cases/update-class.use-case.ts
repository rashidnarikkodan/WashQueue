import { ConflictError } from "@/common/errors/conflict-error";
import { NotFoundError } from "@/common/errors/not-found-error";

import { ClassResponseDto, UpdateClassInput } from "../dtos/class.dto";
import { IUpdateClassUseCase } from "../interfaces/vehicle-class-usecases.interface";

import { IVehicleClassRepository } from "../../domain/repositories/vehicle-class.repsoitory";
import { IVehicleCategoryRepository } from "../../domain/repositories/vehicle-category.repsoitory";

import { slugify } from "@/common/utils/slugify";

export class UpdateClassUseCase implements IUpdateClassUseCase {
  constructor(
    private readonly classRepository: IVehicleClassRepository,
    private readonly categoryRepository: IVehicleCategoryRepository
  ) {}

  async execute(id: string, updates: UpdateClassInput): Promise<ClassResponseDto> {
    const vehicleClass = await this.classRepository.findById(id);

    if (!vehicleClass) {
      throw new NotFoundError("Vehicle class not found");
    }

    if (
      updates.categoryId !== undefined &&
      updates.categoryId !== vehicleClass.categoryId
    ) {
      const category = await this.categoryRepository.findById(updates.categoryId);

      if (!category) {
        throw new NotFoundError("Vehicle category not found");
      }

      vehicleClass.changeCategory(updates.categoryId);
    }

    if (
      updates.name !== undefined &&
      updates.name !== vehicleClass.name
    ) {
      const existingByName = await this.classRepository.findByName(updates.name);

      if (existingByName && existingByName.id !== vehicleClass.id) {
        throw new ConflictError(
          `Vehicle class "${updates.name}" already exists`
        );
      }

      const slug = slugify(updates.name);

      const existingBySlug = await this.classRepository.findBySlug(slug);

      if (existingBySlug && existingBySlug.id !== vehicleClass.id) {
        throw new ConflictError(
          `Vehicle class slug "${slug}" already exists`
        );
      }

      vehicleClass.rename(updates.name);
    }

    if (
      updates.description !== undefined &&
      updates.description !== vehicleClass.description
    ) {
      vehicleClass.changeDescription(updates.description);
    }

    if (
      updates.order !== undefined &&
      updates.order !== vehicleClass.order
    ) {
      vehicleClass.changeOrder(updates.order);
    }

    if (
      updates.isActive !== undefined &&
      updates.isActive !== vehicleClass.isActive
    ) {
      vehicleClass.changeStatus(updates.isActive);
    }

    const updated = await this.classRepository.save(vehicleClass);

    return {
      id: updated.id,
      categoryId: updated.categoryId,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      order: updated.order,
      isActive: updated.isActive,
    };
  }
}