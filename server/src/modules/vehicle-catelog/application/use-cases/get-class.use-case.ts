import { IGetClassUseCase } from "../interfaces/vehicle-class-usecases.interface"
import { ClassResponseDto } from "../dtos/class.dto"
import { IVehicleClassRepository } from "../../domain/repositories/vehicle-class.repsoitory"
import { NotFoundError } from "@/common/errors/not-found-error"

export class GetClassUseCase implements IGetClassUseCase {
  constructor(private readonly classRepository: IVehicleClassRepository) {}

  async execute(id: string): Promise<ClassResponseDto | null> {
    const vehicleClass = await this.classRepository.findById(id)
    if (!vehicleClass) {
      throw new NotFoundError("Vehicle class not found")
    }

    return {
      id: vehicleClass.id,
      categoryId: vehicleClass.categoryId,
      name: vehicleClass.name,
      slug: vehicleClass.slug,
      description: vehicleClass.description,
      order: vehicleClass.order,
      isActive: vehicleClass.isActive
    }
  }
}
