import { IBaseRepository } from "@/core/domain/repository.interface"
import { Station } from "../entities/Station"

export interface IStationRepository extends IBaseRepository<Station> {
  findByOwnerId(ownerId: string): Promise<Station[]>
  findByName(name: string): Promise<Station | null>
}
