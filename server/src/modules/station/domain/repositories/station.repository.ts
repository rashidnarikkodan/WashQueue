import { IBaseRepository } from "@/core/domain/repository.interface"
import { Station } from "../entities/Station"
import { GetStationsQuery } from "../../application/dtos/get-stations.dto"

export interface StationFilter extends GetStationsQuery {
  city?: string
  state?: string
  country?: string
}


export interface NearbyStationFilter {
  latitude: number
  longitude: number
  radiusKm: number
  
  vehicleClassId?: string
  extraServiceIds?: string[]
  minimumRating?: number

  minHalfWashPrice?: number
  maxHalfWashPrice?: number
  minFullWashPrice?: number
  maxFullWashPrice?: number

  page?: number
  limit?: number
}

export interface IStationRepository extends IBaseRepository<Station> {
  findByOwnerId(ownerId: string): Promise<Station[]>
  findByManagerId(managerId: string): Promise<Station[]>
  setManagerId(stationId: string, managerId: string | null): Promise<void>
  findByName(name: string): Promise<Station | null>
  findByIds(ids: string[]): Promise<Station[]>
  findAll(filter: StationFilter): Promise<{ stations: Station[]; total: number }>
  findNearby(filter: NearbyStationFilter): Promise<Station[]>
  findStationManagedByOwner(
    ownerId: string,
    managerUserId: string,
    excludeStationId?: string
  ): Promise<Station | null>
}
