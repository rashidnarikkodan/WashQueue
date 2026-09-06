import { ICreateClassUseCase } from "../interfaces/vehicle-class-usecases.interface"
import { CreateClassInput, ClassResponseDto } from "../dtos/class.dto"
import { IVehicleClassRepository } from "../../domain/repositories/vehicle-class.repsoitory"
import { IVehicleCategoryRepository } from "../../domain/repositories/vehicle-category.repsoitory"
import { VehicleClass } from "../../domain/entities/VehicleClass"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ConflictError } from "@/common/errors/conflict-error"
import { slugify } from "@/common/utils/slugify"
import { randomUUID } from "node:crypto"

export class CreateClassUseCase implements ICreateClassUseCase {
  constructor(
    private readonly classRepository: IVehicleClassRepository,
    private readonly categoryRepository: IVehicleCategoryRepository
  ) {}

  async execute(input: CreateClassInput): Promise<ClassResponseDto> {
    const category = await this.categoryRepository.findById(input.categoryId)
    if (!category) {
      throw new NotFoundError("Vehicle category not found")
    }

    const slug = input.slug || slugify(input.name)

    const existingByName = await this.classRepository.findByName(input.name)
    if (existingByName) {
      throw new ConflictError(`Vehicle class with name "${input.name}" already exists`)
    }

    const existingBySlug = await this.classRepository.findBySlug(slug)
    if (existingBySlug) {
      throw new ConflictError(`Vehicle class with slug "${slug}" already exists`)
    }

    const id = randomUUID()
    const vehicleClass = new VehicleClass({
      id,
      categoryId: input.categoryId,
      name: input.name,
      slug,
      description: input.description,
      isActive: true,
      order: input.order ?? 0,
    })

    const savedClass = await this.classRepository.save(vehicleClass)

    return {
      id: savedClass.id,
      categoryId: savedClass.categoryId,
      name: savedClass.name,
      slug: savedClass.slug,
      description: savedClass.description,
      order: savedClass.order,
      isActive: savedClass.isActive,
    }
  }
}
