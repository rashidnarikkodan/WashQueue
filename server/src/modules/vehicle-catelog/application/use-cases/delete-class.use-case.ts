import { IDeleteClassUseCase } from "../interfaces/vehicle-class-usecases.interface"
import { IVehicleClassRepository } from "../../domain/repositories/vehicle-class.repsoitory"
import { NotFoundError } from "@/common/errors/not-found-error"

export class DeleteClassUseCase implements IDeleteClassUseCase {
  constructor(private readonly classRepository: IVehicleClassRepository) {}

  async execute(id: string): Promise<void> {
    const vehicleClass = await this.classRepository.findById(id)
    if (!vehicleClass) {
      throw new NotFoundError("Vehicle class not found")
    }

    await this.classRepository.delete(id)
  }
}
