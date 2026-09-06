import { IBaseRepository } from "@/core/domain/repository.interface"
import { Owner } from "../entities/Owner"

export interface IOwnerRepository extends IBaseRepository<Owner> {
  findByUserId(userId: string): Promise<Owner | null>
  updateIsManager(userId: string, isManager: boolean): Promise<void>
}
