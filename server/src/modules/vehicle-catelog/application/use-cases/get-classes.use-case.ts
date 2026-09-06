import { IGetClassesUseCase } from "../interfaces/vehicle-class-usecases.interface"
import { ClassResponseDto } from "../dtos/class.dto"
import { IVehicleClassRepository } from "../../domain/repositories/vehicle-class.repsoitory"

export class GetClassesUseCase implements IGetClassesUseCase {
  constructor(private readonly classRepository: IVehicleClassRepository) {}

  async execute(filter?: { categoryId?: string }): Promise<ClassResponseDto[]> {
    const classes = await this.classRepository.findAll(filter)
    return classes.map((vehicleClass) => ({
      id: vehicleClass.id,
      categoryId: vehicleClass.categoryId,
      name: vehicleClass.name,
      slug: vehicleClass.slug,
      description: vehicleClass.description,
      order: vehicleClass.order,
      isActive: vehicleClass.isActive,
    }))
  }
}
