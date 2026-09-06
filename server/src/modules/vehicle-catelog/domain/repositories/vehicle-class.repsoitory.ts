import { IBaseRepository } from "@/core/domain/repository.interface"
import { VehicleClass } from "../entities/VehicleClass"

export interface IVehicleClassRepository extends IBaseRepository<VehicleClass> {
  findAll(filter?: { categoryId?: string }): Promise<VehicleClass[]>
  findBySlug(slug: string): Promise<VehicleClass | null>
  findByName(name: string): Promise<VehicleClass | null>
}
