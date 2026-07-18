import { IBaseRepository } from "@/core/domain/repository.interface"
import { Station } from "../entities/Station"

export interface IStationRepository extends IBaseRepository<Station> {
  findByProviderId(providerId: string): Promise<Station[]>
  findByName(name: string): Promise<Station | null>
}
