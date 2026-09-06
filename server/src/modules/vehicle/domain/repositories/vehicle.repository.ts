import { IBaseRepository } from "@/core/domain/repository.interface"
import { Vehicle } from "../entities/Vehicle"

export interface IVehicleRepository extends IBaseRepository<Vehicle> {
  findByUserId(userId: string): Promise<Vehicle[]>
  findPrimaryByUserId(userId: string): Promise<Vehicle | null>
  clearPrimaryStatusForUser(userId: string): Promise<void>
}
