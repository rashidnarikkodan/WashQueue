import { IBaseRepository } from "@/core/domain/repository.interface"
import { VehicleCategory } from "../entities/VehicleCategory"

export interface IVehicleCategoryRepository extends IBaseRepository<VehicleCategory> {
  findAll(): Promise<VehicleCategory[]>
  findBySlug(slug: string): Promise<VehicleCategory | null>
  findByName(name: string): Promise<VehicleCategory | null>
}
